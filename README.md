# WhatsApp Viewer Service

Standalone microservice that listens for incoming WhatsApp messages and verifies OTPs against pending records.

## API

### Register pending verification

`POST /api/v1/whatsapp-verification`

Body:

```json
{
  "requestId": "uuid",
  "origin": "site-a.example.internal",
  "visitorPhoneE164": "+919999999999",
  "otp": "A1B2C3",
  "expiresAt": "2026-01-01T00:00:00.000Z",
  "callbackUrl": "http://backend-site-a/internal/verification-callback",
  "metadata": {}
}
```

Notes:
- `callbackUrl` is mandatory for REST integrations.
- `otp` is alphanumeric, case-insensitive, and exactly 6 characters by default.
- HTTP callbacks are allowed by default for internal traffic (`ALLOW_INSECURE_CALLBACKS=true`).

## Environment

- `PORT` (default `3010`)
- `OTP_LENGTH` (default `6`)
- `ALLOW_INSECURE_CALLBACKS` (`true` by default expected for internal networks)
- `CALLBACK_HMAC_SECRET` (payload signing secret)
- `WA_CLIENT_ID` (LocalAuth client id)

## First-time Auth

Run container and scan QR in CLI logs once. Session is stored in mounted auth volume.

