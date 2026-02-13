import express from 'express';
import { env } from './config/env.js';
import { PendingVerificationStore } from './store/pendingVerificationStore.js';
import { createHealthRoutes } from './routes/healthRoutes.js';
import { createVerificationRoutes } from './routes/verificationRoutes.js';
import { createWhatsAppClient } from './whatsapp/client.js';

const app = express();
app.use(express.json());

const state = {
  whatsappReady: false,
  connectedAt: null,
};

const pendingStore = new PendingVerificationStore();
setInterval(() => pendingStore.cleanupExpired(), 30_000).unref();

app.use(createHealthRoutes(state));
app.use(
  createVerificationRoutes({
    pendingStore,
    otpLength: env.otpLength,
    allowInsecureCallbacks: env.allowInsecureCallbacks,
  }),
);

app.listen(env.port, () => {
  console.log(`WhatsApp Viewer Service listening on port ${env.port}`);
});

const client = createWhatsAppClient({
  state,
  waClientId: env.waClientId,
  otpLength: env.otpLength,
  pendingStore,
  callbackHmacSecret: env.callbackHmacSecret,
});

client.initialize();
