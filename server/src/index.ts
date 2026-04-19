import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware/auth';
import { userRoutes } from './routes/users';
import { groupRoutes } from './routes/groups';
import { expenseRoutes } from './routes/expenses';
import { settlementRoutes } from './routes/settlements';
import { activityRoutes } from './routes/activity';
import { balanceRoutes } from './routes/balances';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public route — no auth required
app.post('/api/users/auth', userRoutes);

// Protected routes — require JWT
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/settlements', authMiddleware, settlementRoutes);
app.use('/api/activity', authMiddleware, activityRoutes);
app.use('/api/balances', authMiddleware, balanceRoutes);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`DutchWise API running on port ${PORT}`);
});
