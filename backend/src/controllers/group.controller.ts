import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ensureAuthenticated } from "../utils/authUtils";

export async function createGroup(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const { name } = req.body ?? {};

  if (name === undefined) {
    return res.status(400).json({ error: "Missing required data (name)" });
  }

  const group = await prisma.group.create({
    data: {
      name: name,
      ownerId: req.userId,
      members: {
        create: { userId: req.userId },
      },
    },
  });

  res.status(201).json(group);
}

export async function getMyGroups(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { ownerId: req.userId },
        { members: { some: { userId: req.userId } } },
      ],
    },
    include: {
      owner: { select: { id: true, username: true, realName: true } },
      members: {
        include: {
          user: { select: { id: true, username: true, realName: true } },
        },
      },
    },
  });

  res.json(groups);
}

export async function getSpecificGroup(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const groupId = Number(req.params.id);

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      owner: { select: { id: true, username: true, realName: true } },
      members: {
        include: {
          user: { select: { id: true, username: true, realName: true } },
        },
      },
    },
  });

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  const isOwner = group.ownerId === req.userId;
  const isMember = group.members.some((member) => member.userId === req.userId);

  if (!isOwner && !isMember) {
    return res.status(403).json({ error: "Not authorized to view this group" });
  }

  res.json(group);
}

export async function deleteGroup(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const groupId = Number(req.params.id);

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  if (group.ownerId !== req.userId) {
    return res
      .status(403)
      .json({ error: "Not authorized to delete the group" });
  }

  await prisma.group.delete({
    where: { id: groupId },
  });

  res.status(204).send();
}

export async function addGroupMember(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const groupId = Number(req.params.id);

  const { userId } = req.body ?? {};

  if (userId === undefined) {
    return res
      .status(400)
      .json({ error: "Missing required data (userId of the new member)" });
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: { select: { id: true, username: true, realName: true } },
        },
      },
    },
  });

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  if (group.ownerId !== req.userId) {
    return res
      .status(403)
      .json({ error: "Not authorized to add members to the group" });
  }

  if (req.userId === userId) {
    return res.status(400).json({ error: "Can't add self to the group" });
  }

  const userToAdd = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToAdd) {
    return res.status(404).json({ error: "User not found" });
  }

  const memberAlreadyExists = group.members.some(
    (member) => member.userId === userId,
  );

  if (memberAlreadyExists) {
    return res.status(400).json({ error: "User already in group" });
  }

  const newMember = await prisma.groupMember.create({
    data: { groupId: group.id, userId: userId },
    include: {
      user: { select: { id: true, username: true, realName: true } },
    },
  });

  res.status(201).json(newMember);
}

export async function removeGroupMember(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const groupId = Number(req.params.id);
  const userIdToRemove = Number(req.params.userId);

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  const userSelfIsMember = group.members.some(
    (member) => member.userId === req.userId,
  );

  if (!userSelfIsMember) {
    return res
      .status(403)
      .json({ error: "Not authorized to do anything on this group" });
  }

  const userToRemoveisMember = group.members.some(
    (member) => member.userId === userIdToRemove,
  );

  if (!userToRemoveisMember) {
    return res
      .status(404)
      .json({ error: "User is not a member of this group" });
  }

  if (userIdToRemove === req.userId && group.ownerId !== req.userId) {
    await prisma.groupMember.delete({
      where: {
        groupId_userId: { groupId, userId: userIdToRemove },
      },
    });

    return res.status(204).send();
  }

  if (group.ownerId !== req.userId) {
    return res
      .status(403)
      .json({ error: "Only the owner can remove other members" });
  }

  if (userIdToRemove === group.ownerId) {
    return res.status(400).json({
      error:
        "Cannot remove the group owner (the owner should delete the group)",
    });
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: { groupId, userId: userIdToRemove },
    },
  });

  return res.status(204).send();
}
