import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ensureAuthenticated } from "../utils/authUtils";
import { prisma } from "../lib/prisma";

export async function searchUser(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Parameter 'query' is required" });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: query }, { username: query }],
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
}
