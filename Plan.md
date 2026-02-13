# WhatsApp Verification Viewer Service Plan

## Scope
Build a dedicated Node.js microservice that listens to WhatsApp messages and validates submitted OTP codes for multiple origins/sites.

## Decisions Confirmed
1. REST route: `POST /api/v1/whatsapp-verification`.
2. `callbackUrl` is mandatory for REST requests.
3. Internal service-to-service communication can use HTTP.
4. `siteId` is replaced by `origin` in request payload.
5. OTP rules (current): 6-char alphanumeric, case-insensitive, no special chars.
6. Future WebSocket preference: JWT auth with HttpOnly cookies.

## Phase 1 (Implemented in this change)
- Create `whatsapp-viewer` service under `Project/services/whatsapp-viewer`.
- Add REST endpoint for pending verification registration.
- Validate request payload (`origin`, `callbackUrl`, `otp`, etc.).
- Add in-memory store for pending requests keyed by phone/requestId.
- Consume WhatsApp inbound messages with `whatsapp-web-js`.
- Parse OTP from messages and complete request as `SUCCESS`/`FAILED`.
- Callback to request-specific `callbackUrl` with signed payload.
- Add health endpoints:
  - `/health/live`
  - `/health/ready`
- Add Dockerfile with Chromium dependencies and persistent auth volumes.

## Phase 2 (Next)
- Add retry queue for callback failures.
- Persist pending verifications in Redis with TTL.
- Add callback URL allowlist and stronger anti-replay protections.
- Introduce Socket.IO channel with JWT + HttpOnly cookie auth.

## Phase 3 (Future)
- Multi-origin config file / DB for policy and routing defaults.
- Rich WhatsApp event streaming over WebSocket.
- Admin diagnostics and metrics dashboard.
