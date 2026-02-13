export const validateCallbackUrl = (callbackUrl, allowInsecureCallbacks) => {
  try {
    const parsed = new URL(callbackUrl);
    if (!allowInsecureCallbacks && parsed.protocol !== 'https:') {
      return { ok: false, message: 'Only HTTPS callbackUrl is allowed unless ALLOW_INSECURE_CALLBACKS=true' };
    }

    if (allowInsecureCallbacks && !['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, message: 'callbackUrl must use http or https' };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: 'callbackUrl must be a valid URL' };
  }
};
