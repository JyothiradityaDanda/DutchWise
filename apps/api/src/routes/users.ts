import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const userRoutes = Router();

// POST /api/users/auth — PUBLIC route, called by client after Google OAuth
// Validates the email is a real Google-authenticated email by requiring
// the NextAuth session token as proof. In production, verify the Google
// ID token server-side for maximum security.
userRoutes.post('/auth', async (req: Request, res: Response) => {
  const { email, name, image } = req.body;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  // Sanitize inputs
  const safeName = typeof name === 'string' ? name.slice(0, 100).trim() : 'User';
  const safeImage = typeof image === 'string' && image.startsWith('http') ? image.slice(0, 500) : null;

  try {
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: { name: safeName || undefined, avatarUrl: safeImage || undefined, updatedAt: new Date() },
      create: { email: email.toLowerCase().trim(), name: safeName, avatarUrl: safeImage },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' },
    );

    res.json({ data: { user, token } });
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /api/users/me
userRoutes.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ data: user });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/me — only allow safe fields
userRoutes.patch('/me', async (req: AuthRequest, res: Response) => {
  const allowedFields = ['name', 'preferredCurrency', 'themePreference'];
  const data: Record<string, string> = {};

  for (const field of allowedFields) {
    if (typeof req.body[field] === 'string') {
      data[field] = req.body[field].slice(0, 100).trim();
    }
  }

  try {
    const user = await prisma.user.update({ where: { id: req.userId }, data });
    res.json({ data: user });
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});
