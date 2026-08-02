import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ensureAuthenticated } from "../utils/authUtils";
import { notifyUser } from "../lib/socket";

export async function sharePinWithUser(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);
  const { userId } = req.body ?? {};

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
    include: {
      sharedWithUsers: true,
    },
  });

  if (!pin) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  if (pin.ownerId !== req.userId) {
    return res.status(403).json({ code: "NOT_AUTHORIZED" });
  }

  const userToShare = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToShare) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  if (req.userId === userId) {
    return res.status(400).json({ code: "CANT_DO_ACTION" });
  }

  const isAlreadySharedWithUser = pin.sharedWithUsers.some(
    (shareWithUser) => userId === shareWithUser.userId,
  );

  if (isAlreadySharedWithUser) {
    return res.status(400).json({ code: "ALREADY_SHARED" });
  }

  const newShareWithUser = await prisma.pinShareUser.create({
    data: { pinId: pinId, userId: userId },
  });

  notifyUser(userId, "pins:changed");

  res.status(201).json(newShareWithUser);
}

export async function sharePinWithGroup(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);
  const { groupId } = req.body ?? {};

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
    include: {
      sharedWithGroups: true,
    },
  });

  if (!pin) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  if (pin.ownerId !== req.userId) {
    return res.status(403).json({ code: "NOT_AUTHORIZED" });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: true,
    },
  });

  if (!group) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  const userIsInGroup = group.members.some(
    (member) => member.userId === req.userId,
  );

  if (!userIsInGroup) {
    return res.status(403).json({ code: "NOT_FOUND" });
  }

  const pinIsAlreadyShareInGroup = pin.sharedWithGroups.some(
    (share) => share.groupId === groupId,
  );

  if (pinIsAlreadyShareInGroup) {
    return res.status(400).json({ code: "ALREADY_SHARED" });
  }

  const newShareWithGroup = await prisma.pinShareGroup.create({
    data: { pinId: pinId, groupId: groupId },
  });

  for (const member of group.members) {
    if (member.userId !== req.userId) {
      notifyUser(member.userId, "pins:changed");
    }
  }

  res.status(201).json(newShareWithGroup);
}

export async function unsharePinWithUser(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);
  const userToUnshareId = Number(req.params.userId);

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
    include: {
      sharedWithUsers: true,
    },
  });

  if (!pin) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  if (pin.ownerId !== req.userId) {
    return res.status(403).json({ code: "NOT_AUTHORIZED" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userToUnshareId },
  });

  if (!user) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  if (userToUnshareId === req.userId) {
    return res.status(400).json({ code: "CANT_DO_ACTION" });
  }

  const pinIsSharedWithUser = pin.sharedWithUsers.some(
    (share) => share.userId === userToUnshareId,
  );

  if (!pinIsSharedWithUser) {
    return res.status(400).json({ code: "NOT_SHARED" });
  }

  await prisma.pinShareUser.delete({
    where: {
      pinId_userId: { pinId: pinId, userId: userToUnshareId },
    },
  });

  notifyUser(userToUnshareId, "pins:changed");

  res.status(204).send();
}

export async function unsharePinWithGroup(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pinId = Number(req.params.id);
  const groupToUnshareId = Number(req.params.groupId);

  const pin = await prisma.pin.findUnique({
    where: { id: pinId },
    include: {
      sharedWithGroups: true,
    },
  });

  if (!pin) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  if (pin.ownerId !== req.userId) {
    return res.status(403).json({ code: "NOT_AUTHORIZED" });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupToUnshareId },
  });

  if (!group) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  const pinIsSharedWithGroup = pin.sharedWithGroups.some(
    (share) => share.groupId === groupToUnshareId,
  );

  if (!pinIsSharedWithGroup) {
    return res.status(400).json({ code: "NOT_SHARED" });
  }

  await prisma.pinShareGroup.delete({
    where: {
      pinId_groupId: { pinId: pinId, groupId: groupToUnshareId },
    },
  });

  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId: groupToUnshareId },
    select: { userId: true },
  });

  for (const member of groupMembers) {
    if (member.userId !== req.userId) {
      notifyUser(member.userId, "pins:changed");
    }
  }

  res.status(204).send();
}
