import { sendResultToCallback } from './callbackService.js';

export const handleIncomingOtp = async (phone, otp, dependencies) => {
  const { pendingStore, callbackHmacSecret } = dependencies;
  const records = pendingStore.getByPhone(phone);
  if (!records.length) return;

  const now = Date.now();
  const active = records.filter((record) => new Date(record.expiresAt).getTime() >= now);
  if (!active.length) return;

  const match = active.find((record) => record.otp === otp);
  const target = match || active[0];
  const result = pendingStore.complete(target, match ? 'SUCCESS' : 'FAILED', match ? null : 'OTP_MISMATCH', otp);

  try {
    await sendResultToCallback(result, callbackHmacSecret);
    console.log(`[callback] Sent ${result.status} for requestId=${result.requestId}`);
  } catch (error) {
    console.error(`[callback] Failed for requestId=${result.requestId}:`, error.message);
  }
};
