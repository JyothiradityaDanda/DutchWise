import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const groupRoutes = Router();

// GET /api/groups — list groups the user belongs to
groupRoutes.get('/', async (req: AuthRequest, res: Response) => {
  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: req.userId } } },
    include: {
      members: { include: { user: true } },
      _count: { select: { expenses: { where: { deletedAt: null } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ data: groups });
});

// GET /api/groups/:id
groupRoutes.get('/:id', async (req: AuthRequest, res: Response) => {
  const group = await prisma.group.findFirst({
    where: { id: req.params.id, members: { some: { userId: req.userId } } },
    include: {
      members: { include: { user: true } },
      expenses: {
        where: { deletedAt: null },
        include: { paidByUser: true, participants: { include: { user: true } } },
        orderBy: { date: 'desc' },
      },
      settlements: {
        include: { payer: true, receiver: true },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!group) { res.status(404).json({ error: 'Group not found' }); return; }
  res.json({ data: group });
});

// POST /api/groups
groupRoutes.post('/', async (req: AuthRequest, res: Response) => {
  const { name, type, icon, description } = req.body;

  if (!name?.trim()) { res.status(400).json({ error: 'Name is required' }); return; }

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      type: type || 'other',
      icon: icon || '🎉',
      description: description?.trim() || null,
      createdBy: req.userId!,
      members: {
        create: { userId: req.userId!, role: 'admin' },
      },
    },
    include: { members: { include: { user: true } } },
  });

  await prisma.activityEvent.create({
    data: {
      groupId: group.id,
      actorUserId: req.userId!,
      type: 'group_created',
      entityType: 'group',
      entityId: group.id,
      metadata: { name: group.name },
    },
  });

  res.status(201).json({ data: group });
});

// POST /api/groups/:id/members — add a member by email
groupRoutes.post('/:id/members', async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: 'Email is required' }); return; }

  // Verify requester is a member
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } },
  });
  if (!membership) { res.status(403).json({ error: 'Not a member of this group' }); return; }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { res.status(404).json({ error: 'User not found. They need to sign up first.' }); return; }

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: req.params.id, userId: user.id } },
  });
  if (existing) { res.status(409).json({ error: 'User is already a member' }); return; }

  const member = await prisma.groupMember.create({
    data: { groupId: req.params.id, userId: user.id, role: 'member' },
    include: { user: true },
  });

  await prisma.activityEvent.create({
    data: {
      groupId: req.params.id,
      actorUserId: req.userId!,
      type: 'member_added',
      entityType: 'member',
      entityId: member.id,
      metadata: { memberName: user.name, memberEmail: user.email },
    },
  });

  res.status(201).json({ data: member });
});

// DELETE /api/groups/:id
groupRoutes.delete('/:id', async (req: AuthRequest, res: Response) => {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: req.params.id, userId: req.userId! } },
  });
  if (!membership || membership.role !== 'admin') {
    res.status(403).json({ error: 'Only admins can delete groups' });
    return;
  }

  await prisma.group.delete({ where: { id: req.params.id } });
  res.json({ data: { success: true } });
});
