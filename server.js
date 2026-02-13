import 'dotenv/config';
import express from 'express';
import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 3010);
const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);
const ALLOW_INSECURE_CALLBACKS = process.env.ALLOW_INSECURE_CALLBACKS !== 'false';

const app = express();
app.use(express.json());

const state = {
  whatsappReady: false,
  connectedAt: null,
};

class PendingVerificationStore {
  constructor() {
    this.byRequestId = new Map();
    this.byPhone = new Map();
  }

  upsert(record) {
    this.byRequestId.set(record.requestId, record);
    const ids = this.byPhone.get(record.visitorPhoneE164) || new Set();
    ids.add(record.requestId);
    this.byPhone.set(record.visitorPhoneE164, ids);
  }

  getByPhone(phone) {
    const ids = this.byPhone.get(phone);
    if (!ids) return [];
    const records = [...ids]
      .map((id) => this.byRequestId.get(id))
      .filter(Boolean)
      .filter((record) => record.status === 'PENDING')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return records;
  }

  complete(record, status, reason = null, otpReceived = null) {
    const updated = {
      ...record,
      status,
      reason,
      otpReceived,
      updatedAt: new Date().toISOString(),
    };
    this.byRequestId.set(record.requestId, updated);
    const ids = this.byPhone.get(record.visitorPhoneE164);
    if (ids) {
      ids.delete(record.requestId);
      if (!ids.size) this.byPhone.delete(record.visitorPhoneE164);
    }
    return updated;
  }

  cleanupExpired() {
    const now = Date.now();
    for (const record of this.byRequestId.values()) {
      if (record.status !== 'PENDING') continue;
      if (new Date(record.expiresAt).getTime() < now) {
        this.complete(record, 'EXPIRED', 'OTP_EXPIRED');
      }
    }
  }
}

const pendingStore = new PendingVerificationStore();
setInterval(() => pendingStore.cleanupExpired(), 30_000).unref();

const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return null;
  if (cleaned.startsWith('+')) return cleaned;
  return `+${cleaned}`;
};

const extractOtpFromText = (messageText) => {
  if (!messageText || typeof messageText !== 'string') return null;
  const match = messageText.match(new RegExp(`\\b([A-Za-z0-9]{${OTP_LENGTH}})\\b`, 'i'));
  return match ? match[1].toUpperCase() : null;
};

const validateOtp = (otp) => typeof otp === 'string' && new RegExp(`^[A-Za-z0-9]{${OTP_LENGTH}}$`).test(otp);

const validateCallbackUrl = (callbackUrl) => {
  try {
    const parsed = new URL(callbackUrl);
    if (!ALLOW_INSECURE_CALLBACKS && parsed.protocol !== 'https:') {
      return { ok: false, message: 'Only HTTPS callbackUrl is allowed unless ALLOW_INSECURE_CALLBACKS=true' };
    }
    if (ALLOW_INSECURE_CALLBACKS && !['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, message: 'callbackUrl must use http or https' };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: 'callbackUrl must be a valid URL' };
  }
};

const sendResultToCallback = async (record) => {
  const payload = {
    requestId: record.requestId,
    origin: record.origin,
    visitorPhoneE164: record.visitorPhoneE164,
    status: record.status,
    reason: record.reason,
    otpReceived: record.otpReceived,
    receivedAt: new Date().toISOString(),
  };

  const signature = crypto
    .createHmac('sha256', process.env.CALLBACK_HMAC_SECRET || 'dev-secret')
    .update(JSON.stringify(payload))
    .digest('hex');

  const response = await fetch(record.callbackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Whatsapp-Viewer-Signature': signature,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Callback failed with status ${response.status}`);
  }
};

const handleIncomingOtp = async (phone, otp) => {
  const records = pendingStore.getByPhone(phone);
  if (!records.length) return;

  const now = Date.now();
  const active = records.filter((record) => new Date(record.expiresAt).getTime() >= now);
  if (!active.length) return;

  const match = active.find((record) => record.otp === otp);
  const target = match || active[0];
  const result = pendingStore.complete(
    target,
    match ? 'SUCCESS' : 'FAILED',
    match ? null : 'OTP_MISMATCH',
    otp,
  );

  try {
    await sendResultToCallback(result);
    console.log(`[callback] Sent ${result.status} for requestId=${result.requestId}`);
  } catch (error) {
    console.error(`[callback] Failed for requestId=${result.requestId}:`, error.message);
  }
};

app.get('/health/live', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/ready', (_req, res) => {
  if (!state.whatsappReady) {
    return res.status(503).json({ status: 'not_ready', whatsappReady: false });
  }

  return res.json({
    status: 'ready',
    whatsappReady: true,
    connectedAt: state.connectedAt,
  });
});

app.post('/api/v1/whatsapp-verification', (req, res) => {
  const { requestId, origin, visitorPhoneE164, otp, expiresAt, callbackUrl, metadata = {} } = req.body || {};

  if (!requestId || typeof requestId !== 'string') {
    return res.status(400).json({ error: 'requestId is required' });
  }
  if (!origin || typeof origin !== 'string') {
    return res.status(400).json({ error: 'origin is required' });
  }

  const normalizedPhone = normalizePhone(visitorPhoneE164);
  if (!normalizedPhone) {
    return res.status(400).json({ error: 'visitorPhoneE164 must be a valid phone number' });
  }

  if (!validateOtp(otp)) {
    return res.status(400).json({ error: `otp must be alphanumeric and exactly ${OTP_LENGTH} chars` });
  }

  if (!callbackUrl || typeof callbackUrl !== 'string') {
    return res.status(400).json({ error: 'callbackUrl is required for REST mode' });
  }

  const callbackValidation = validateCallbackUrl(callbackUrl);
  if (!callbackValidation.ok) {
    return res.status(400).json({ error: callbackValidation.message });
  }

  const expiration = new Date(expiresAt);
  if (Number.isNaN(expiration.getTime())) {
    return res.status(400).json({ error: 'expiresAt must be a valid ISO datetime' });
  }

  const record = {
    requestId,
    origin,
    visitorPhoneE164: normalizedPhone,
    otp: otp.toUpperCase(),
    expiresAt: expiration.toISOString(),
    callbackUrl,
    metadata,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  pendingStore.upsert(record);

  return res.status(202).json({
    accepted: true,
    requestId,
    status: 'PENDING',
    mode: 'REST_CALLBACK',
  });
});

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: process.env.WA_CLIENT_ID || 'whatsapp-viewer-service',
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  },
});

client.on('qr', (qr) => {
  console.log('Scan this QR code from WhatsApp to authenticate the service:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  state.whatsappReady = true;
  state.connectedAt = new Date().toISOString();
  console.log('WhatsApp client is ready.');
});

client.on('disconnected', (reason) => {
  state.whatsappReady = false;
  console.log('WhatsApp client disconnected:', reason);
});

client.on('message', async (message) => {
  const rawPhone = message.from?.split('@')[0];
  const phone = normalizePhone(rawPhone);
  const otp = extractOtpFromText(message.body || '');

  if (!phone || !otp) return;

  console.log(`[whatsapp] Incoming OTP candidate from ${phone}`);
  await handleIncomingOtp(phone, otp);
});

app.listen(PORT, () => {
  console.log(`WhatsApp Viewer Service listening on port ${PORT}`);
});

client.initialize();
