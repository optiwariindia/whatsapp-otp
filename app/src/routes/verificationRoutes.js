import { Router } from 'express';
import { normalizePhone } from '../utils/phone.js';
import { validateOtp } from '../utils/otp.js';
import { validateCallbackUrl } from '../utils/callback.js';

export const createVerificationRoutes = (dependencies) => {
  const { pendingStore, otpLength, allowInsecureCallbacks } = dependencies;
  const router = Router();

  router.post('/api/v1/whatsapp-verification', (req, res) => {
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

    if (!validateOtp(otp, otpLength)) {
      return res.status(400).json({ error: `otp must be alphanumeric and exactly ${otpLength} chars` });
    }

    if (!callbackUrl || typeof callbackUrl !== 'string') {
      return res.status(400).json({ error: 'callbackUrl is required for REST mode' });
    }

    const callbackValidation = validateCallbackUrl(callbackUrl, allowInsecureCallbacks);
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

  return router;
};
