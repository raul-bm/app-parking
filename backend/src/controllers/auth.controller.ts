import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { ensureAuthenticated } from "../utils/authUtils";

export async function register(req: Request, res: Response) {
  let { email, password, username, realName } = req.body ?? {};

  if (!email || !password || !username || !realName) {
    return res.status(400).json({ code: "MISSING_DATA" });
  }

  email = email.toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ code: "INVALID_EMAIL" });
  }

  username = username.toLowerCase();

  if (username.includes(" ")) {
    return res.status(400).json({ code: "USERNAME_SPACES" });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return res.status(409).json({ code: "EMAIL_REGISTERED" });
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    return res.status(409).json({ code: "USERNAME_USED" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, username, realName },
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
    username: user.username,
    realName: user.realName,
  });
}

export async function login(req: Request, res: Response) {
  let { identifier, password } = req.body ?? {};

  if (!identifier || !password) {
    return res.status(400).json({ code: "MISSING_DATA" });
  }

  identifier = identifier.toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });
  if (!user) {
    return res.status(401).json({ code: "INVALID_CREDENTIALS" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ code: "INVALID_CREDENTIALS" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Environment variable JWT_SECRET missing");
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      realName: user.realName,
    },
  });
}

export async function me(req: AuthRequest, res: Response) {
  if (!ensureAuthenticated(req, res)) return;

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, username: true, realName: true },
  });

  if (!user) {
    return res.status(404).json({ code: "NOT_FOUND" });
  }

  res.json(user);
}
