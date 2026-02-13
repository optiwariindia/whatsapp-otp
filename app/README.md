# WhatsApp Viewer Service (App)

Node.js microservice that listens for incoming WhatsApp messages and verifies OTPs against pending verification records.

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

## Health

- `GET /health/live`
- `GET /health/ready`

## Runtime configuration

The app reads runtime values from process environment variables. In this project, those variables are managed by `docker-compose.yml` only.
