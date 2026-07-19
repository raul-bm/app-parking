import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ensureAuthenticated } from "../utils/authUtils";

export async function sendFriendRequest(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const targetUserId = Number(req.params.userId);

  if (targetUserId === req.userId) {
    return res
      .status(406)
      .json({ error: "User can't send friend request to self" });
  }

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: req.userId, addresseeId: targetUserId },
        { requesterId: targetUserId, addresseeId: req.userId },
      ],
    },
  });

  if (existingFriendship !== null) {
    if (existingFriendship?.status === "ACCEPTED") {
      return res.status(409).json({ error: "Already friends" });
    } else {
      return res
        .status(409)
        .json({ error: "A pending request already exists" });
    }
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: req.userId, addresseeId: targetUserId },
    include: {
      addressee: {
        select: { username: true },
      },
    },
  });

  return res.status(201).json(friendship);
}

export async function acceptFriendRequest(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const friendshipId = Number(req.params.id);

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship) {
    return res.status(404).json({ error: "Friend request not found" });
  }

  if (friendship.addresseeId !== req.userId) {
    return res
      .status(403)
      .json({ error: "Only the recipient can accept the request" });
  }

  if (friendship.status !== "PENDING") {
    return res.status(400).json({ error: "This request is no longer pending" });
  }

  const updated = await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  });

  res.json(updated);
}

export async function rejectFriendRequest(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const friendshipId = Number(req.params.id);

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship) {
    return res.status(404).json({ error: "Friend request not found" });
  }

  if (friendship.status !== "PENDING") {
    return res.status(400).json({ error: "This request is no longer pending" });
  }

  if (
    friendship.addresseeId !== req.userId &&
    friendship.requesterId !== req.userId
  ) {
    return res
      .status(403)
      .json({ error: "Not authorized to delete this friendship" });
  }

  await prisma.friendship.delete({
    where: { id: friendshipId },
  });

  res.status(204).send();
}

export async function listFriends(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: req.userId }, { addresseeId: req.userId }],
      status: "ACCEPTED",
    },
    include: {
      requester: {
        select: { id: true, username: true, realName: true },
      },
      addressee: {
        select: { id: true, username: true, realName: true },
      },
    },
  });

  const friends = friendships.map((f) => {
    const friend = f.requesterId === req.userId ? f.addressee : f.requester;
    return {
      friendshipId: f.id,
      username: friend.username,
      realName: friend.realName,
      friendsSince: f.createdAt,
    };
  });

  res.json(friends);
}

export async function listPendingRequests(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const pendingRequests = await prisma.friendship.findMany({
    where: {
      addresseeId: req.userId,
      status: "PENDING",
    },
    include: {
      requester: {
        select: { id: true, username: true, realName: true, email: true },
      },
    },
  });

  res.json(pendingRequests);
}

export async function removeFriend(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const friendshipId = Number(req.params.id);

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship) {
    return res.status(404).json({ error: "Friendship not found" });
  }

  if (
    friendship.requesterId !== req.userId &&
    friendship.addresseeId !== req.userId
  ) {
    return res
      .status(403)
      .json({ error: "Not authorized to remove this friendship" });
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });

  res.status(204).send();
}

export async function listSentRequests(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const sentRequests = await prisma.friendship.findMany({
    where: {
      requesterId: req.userId,
      status: "PENDING",
    },
    include: {
      addressee: {
        select: { id: true, username: true, realName: true },
      },
    },
  });

  res.json(sentRequests);
}
