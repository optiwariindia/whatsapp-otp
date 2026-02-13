import crypto from 'node:crypto';

export const sendResultToCallback = async (record, callbackHmacSecret) => {
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
    .createHmac('sha256', callbackHmacSecret)
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
