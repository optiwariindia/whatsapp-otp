export const extractOtpFromText = (messageText, otpLength) => {
  if (!messageText || typeof messageText !== 'string') return null;
  const match = messageText.match(new RegExp(`\\b([A-Za-z0-9]{${otpLength}})\\b`, 'i'));
  return match ? match[1].toUpperCase() : null;
};

export const validateOtp = (otp, otpLength) =>
  typeof otp === 'string' && new RegExp(`^[A-Za-z0-9]{${otpLength}}$`).test(otp);
