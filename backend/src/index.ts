import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { setupCronJobs } from './cron/scheduler.js';
import { webhookRouter } from './routes/webhooks.js';
import { healthRouter } from './routes/health.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/webhooks', webhookRouter);

setupCronJobs();

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
