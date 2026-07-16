import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ensureAuthenticated } from "../utils/authUtils";

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
    return res.status(404).json({ error: "Pin not found" });
  }

  if (pin.ownerId !== req.userId) {
    return res.status(403).json({ error: "Not authorized to share this pin" });
  }

  const userToShare = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToShare) {
    return res.status(404).json({ error: "User doesn't exist" });
  }

  if (req.userId === userId) {
    return res.status(400).json({ error: "Can't share to self" });
  }

  const isAlreadySharedWithUser = pin.sharedWithUsers.some(
    (shareWithUser) => userId === shareWithUser.userId,
  );

  if (isAlreadySharedWithUser) {
    return res
      .status(400)
      .json({ error: "This pin is already shared with the user" });
  }

  const newShareWithUser = await prisma.pinShareUser.create({
    data: { pinId: pinId, userId: userId },
  });

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
    return res.status(404).json({ error: "Pin not found" });
  }

  if (pin.ownerId !== req.userId) {
    return res.status(403).json({ error: "Not authorized to share this pin" });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: true,
    },
  });

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  const userIsInGroup = group.members.some(
    (member) => member.userId === req.userId,
  );

  if (!userIsInGroup) {
    return res.status(403).json({ error: "The user is not on the group" });
  }

  const pinIsAlreadyShareInGroup = pin.sharedWithGroups.some(
    (share) => share.groupId === groupId,
  );

  if (pinIsAlreadyShareInGroup) {
    return res
      .status(400)
      .json({ error: "Pin is already shared in the group" });
  }

  const newShareWithGroup = await prisma.pinShareGroup.create({
    data: { pinId: pinId, groupId: groupId },
  });

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
    return res.status(404).json({ error: "Pin not found" });
  }

  if (pin.ownerId !== req.userId) {
    return res
      .status(403)
      .json({ error: "Not authorized to unshare this pin" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userToUnshareId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (userToUnshareId === req.userId) {
    return res.status(400).json({ error: "Can't unshare the pin to self" });
  }

  const pinIsSharedWithUser = pin.sharedWithUsers.some(
    (share) => share.userId === userToUnshareId,
  );

  if (!pinIsSharedWithUser) {
    return res.status(400).json({ error: "Pin is not shared with user" });
  }

  await prisma.pinShareUser.delete({
    where: {
      pinId_userId: { pinId: pinId, userId: userToUnshareId },
    },
  });

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
    return res.status(404).json({ error: "Pin not found" });
  }

  if (pin.ownerId !== req.userId) {
    return res
      .status(403)
      .json({ error: "Not authorized to unshare this pin" });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupToUnshareId },
  });

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  const pinIsSharedWithGroup = pin.sharedWithGroups.some(
    (share) => share.groupId === groupToUnshareId,
  );

  if (!pinIsSharedWithGroup) {
    return res.status(400).json({ error: "Pin is not shared with group" });
  }

  await prisma.pinShareGroup.delete({
    where: {
      pinId_groupId: { pinId: pinId, groupId: groupToUnshareId },
    },
  });

  res.status(204).send();
}
