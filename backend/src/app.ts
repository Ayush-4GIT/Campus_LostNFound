import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import authRoutes  from './routes/auth.routes';
import itemRoutes  from './routes/item.routes';
import claimRoutes from './routes/claim.routes';
import userRoutes  from './routes/user.routes';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/items',  itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/users',  userRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Campus LostNFound API is running 🎓' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
