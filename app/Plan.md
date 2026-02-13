# WhatsApp Verification Viewer Service Plan

## Objective
Restructure the project into an app-first layout while keeping container orchestration at the repository root.

## Updated Structure
- Root keeps only Docker/runtime assets:
  - `Dockerfile`
  - `docker-compose.yml`
  - root `README.md`
- `app/` contains all non-Docker project content:
  - source code (`app/src/**`)
  - package manifest (`app/package.json`)
  - app docs (`app/README.md`, this file)

## Environment Strategy (Docker Compose only)
- Removed dotenv usage from application startup.
- Runtime configuration is provided entirely from `docker-compose.yml`.
- App still supports standard process env reads, but no `.env` dependency is required.

## Code Segregation
- Split monolithic `server.js` into focused modules:
  - config (`src/config/env.js`)
  - store (`src/store/pendingVerificationStore.js`)
  - utilities (`src/utils/*.js`)
  - services (`src/services/*.js`)
  - routes (`src/routes/*.js`)
  - WhatsApp client wiring (`src/whatsapp/client.js`)
  - app entrypoint (`src/index.js`)

## Next Steps
1. Add automated tests for route validation and OTP matching flow.
2. Introduce persistence (Redis) for pending verification records.
3. Add callback retry handling and observability metrics.
