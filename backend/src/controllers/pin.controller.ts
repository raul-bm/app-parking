import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ensureAuthenticated } from "../utils/authUtils";

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
    orderBy: { createdAt: "desc" },
  });

  res.json(pins);
}

export async function deletePin(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
  });

  if (!pin) {
    return res.status(404).json({ error: "Pin not found" });
  }

  if (pin.ownerId !== req.userId) {
    return res.status(403).json({ error: "Not authorized to delete this pin" });
  }

  await prisma.pin.delete({
    where: { id: pinId },
  });

  res.status(204).send();
}

export async function getSpecificPin(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
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
      OR: [
        { sharedWithUsers: { some: { userId: req.userId } } },
        {
          sharedWithGroups: {
            some: { group: { members: { some: { userId: req.userId } } } },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(pins);
}
