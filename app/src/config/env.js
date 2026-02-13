export const env = {
  port: Number(process.env.PORT || 3010),
  otpLength: Number(process.env.OTP_LENGTH || 6),
  allowInsecureCallbacks: process.env.ALLOW_INSECURE_CALLBACKS !== 'false',
  callbackHmacSecret: process.env.CALLBACK_HMAC_SECRET || 'dev-secret',
  waClientId: process.env.WA_CLIENT_ID || 'whatsapp-viewer-service',
};
