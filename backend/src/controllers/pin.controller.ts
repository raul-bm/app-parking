import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ensureAuthenticated } from "../utils/authUtils";
import { notifyUser } from "../lib/socket";

export async function createPin(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const { lat, long, note } = req.body ?? {};

  if (lat === undefined || long === undefined) {
    return res.status(400).json({ error: "Missing required data (lat/long)" });
  }

  const pin = await prisma.pin.create({
    data: { lat, long, note, ownerId: req.userId },
  });

  res.status(201).json(pin);
}

export async function getPins(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pins = await prisma.pin.findMany({
    where: {
      OR: [
        { ownerId: req.userId },
        { sharedWithUsers: { some: { userId: req.userId } } },
        {
          sharedWithGroups: {
            some: { group: { members: { some: { userId: req.userId } } } },
          },
        },
      ],
    },
    include: {
      owner: {
        select: { realName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(pins);
}

export async function deletePin(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);

  const pinWithShares = await prisma.pin.findUnique({
    where: { id: pinId },
    include: {
      sharedWithUsers: { select: { userId: true } },
      sharedWithGroups: {
        include: {
          group: { include: { members: { select: { userId: true } } } },
        },
      },
    },
  });

  if (!pinWithShares) {
    return res.status(404).json({ error: "Pin not found" });
  }

  if (pinWithShares.ownerId !== req.userId) {
    return res.status(403).json({ error: "Not authorized to delete this pin" });
  }

  const notifiedUsers = new Set<number>();
  for (const s of pinWithShares.sharedWithUsers) notifiedUsers.add(s.userId);
  for (const gs of pinWithShares.sharedWithGroups) {
    for (const m of gs.group.members) notifiedUsers.add(m.userId);
  }

  await prisma.pin.delete({ where: { id: pinId } });

  for (const userId of notifiedUsers) {
    notifyUser(userId, "pins:changed");
  }

  res.status(204).send();
}

export async function getSpecificPin(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
    include: {
      owner: {
        select: { realName: true },
      },
      sharedWithUsers: {
        include: {
          user: { select: { id: true, username: true, realName: true } },
        },
      },
      sharedWithGroups: {
        include: { group: { select: { id: true, name: true } } },
      },
    },
  });

  if (!pin) {
    return res.status(404).json({ error: "Pin not found" });
  }

  const isOwner = pin.ownerId === req.userId;
  const isSharedWithUser = await prisma.pinShareUser.findUnique({
    where: { pinId_userId: { pinId, userId: req.userId } },
  });
  const isSharedWithGroup = await prisma.pinShareGroup.findFirst({
    where: {
      pinId,
      group: { members: { some: { userId: req.userId } } },
    },
  });

  if (!isOwner && !isSharedWithUser && !isSharedWithGroup) {
    return res.status(403).json({ error: "Not authorized to view this pin" });
  }

  res.json(pin);
}

export async function getSharedWithMe(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pins = await prisma.pin.findMany({
    where: {
      ownerId: { not: req.userId },
      OR: [
        { sharedWithUsers: { some: { userId: req.userId } } },
        {
          sharedWithGroups: {
            some: { group: { members: { some: { userId: req.userId } } } },
          },
        },
      ],
    },
    include: {
      owner: {
        select: { realName: true },
      },
      sharedWithUsers: {
        where: { userId: req.userId },
        select: { userId: true, createdAt: true },
      },
      sharedWithGroups: {
        select: {
          createdAt: true,
          group: { select: { id: true, name: true } },
        },
      },
    },
  });

  res.json(pins);
}

export async function updatePin(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);
  const { note } = req.body ?? {};

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
  });

  if (!pin) {
    return res.status(404).json({ error: "Pin not found" });
  }

  if (pin.ownerId !== req.userId) {
    return res.status(403).json({ error: "Not authorized to update this pin" });
  }

  const updated = await prisma.pin.update({
    where: { id: pinId },
    data: { note },
    include: { owner: { select: { realName: true } } },
  });

  const shares = await prisma.pin.findUnique({
    where: { id: pinId },
    include: {
      sharedWithUsers: { select: { userId: true } },
      sharedWithGroups: {
        include: {
          group: { include: { members: { select: { userId: true } } } },
        },
      },
    },
  });

  if (shares) {
    const notifiedUsers = new Set<number>();
    for (const s of shares.sharedWithUsers) notifiedUsers.add(s.userId);
    for (const gs of shares.sharedWithGroups) {
      for (const m of gs.group.members) notifiedUsers.add(m.userId);
    }
    for (const userId of notifiedUsers) {
      notifyUser(userId, "pins:changed");
    }
  }

  res.json(updated);
}
