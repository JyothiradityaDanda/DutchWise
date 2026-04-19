import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const activityRoutes = Router();

// GET /api/activity?groupId=xxx (optional)
activityRoutes.get('/', async (req: AuthRequest, res: Response) => {
  const { groupId } = req.query;

  if (groupId) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: groupId as string, userId: req.userId! } },
    });
    if (!member) { res.status(403).json({ error: 'Not a member' }); return; }

    const activities = await prisma.activityEvent.findMany({
      where: { groupId: groupId as string },
      include: { actor: true, group: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ data: activities });
    return;
  }

  // All activity across user's groups
  const userGroups = await prisma.groupMember.findMany({
    where: { userId: req.userId! },
    select: { groupId: true },
  });

  const activities = await prisma.activityEvent.findMany({
    where: { groupId: { in: userGroups.map((g) => g.groupId) } },
    include: { actor: true, group: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ data: activities });
});
