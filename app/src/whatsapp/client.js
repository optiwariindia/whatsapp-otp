import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { normalizePhone } from '../utils/phone.js';
import { extractOtpFromText } from '../utils/otp.js';
import { handleIncomingOtp } from '../services/otpService.js';

export const createWhatsAppClient = (dependencies) => {
  const { state, waClientId, otpLength, pendingStore, callbackHmacSecret } = dependencies;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: waClientId }),
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
    const otp = extractOtpFromText(message.body || '', otpLength);

    if (!phone || !otp) return;

    console.log(`[whatsapp] Incoming OTP candidate from ${phone}`);
    await handleIncomingOtp(phone, otp, { pendingStore, callbackHmacSecret });
  });

  return client;
};
