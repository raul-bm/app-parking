import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleAuth(req: Request, res: Response) {
  const { idToken } = req.body ?? {};

  if (!idToken) {
    return res.status(400).json({ code: "MISSING_DATA" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ code: "SERVER_ERROR" });
  }

  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(400).json({ code: "INVALID_CREDENTIALS" });
    }

    const googleEmail = payload.email.toLowerCase();
    const googleName = payload.name || "";

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: googleEmail, mode: "insensitive" } },
    });

    if (existingUser) {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) throw new Error("JWT_SECRET missing");

      const token = jwt.sign({ userId: existingUser.id }, jwtSecret, {
        expiresIn: "7d",
      });

      return res.json({
        token,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          username: existingUser.username,
          realName: existingUser.realName,
        },
      });
    }
    const preRegisterToken = jwt.sign(
      { googleEmail, googleName, purpose: "google-register" },
      process.env.JWT_SECRET!,
      { expiresIn: "10m" },
    );

    console.log("a");

    return res.json({
      requiresProfile: true,
      preRegisterToken,
      googleEmail,
      googleName,
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ code: "INVALID_CREDENTIALS" });
  }
}

export async function googleCompleteRegistration(req: Request, res: Response) {
  const { preRegisterToken, username, realName } = req.body ?? {};

  if (!preRegisterToken || !username || !realName) {
    return res.status(400).json({ code: "MISSING_DATA" });
  }

  try {
    const decoded = jwt.verify(
      preRegisterToken,
      process.env.JWT_SECRET!,
    ) as any;

    if (decoded.purpose !== "google-register" || !decoded.googleEmail) {
      return res.status(400).json({ code: "INVALID_CREDENTIALS" });
    }

    const email = decoded.googleEmail.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    if (normalizedUsername.includes(" ")) {
      return res.status(400).json({ code: "USERNAME_SPACES" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ code: "INVALID_EMAIL" });
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (existingEmail) {
      return res.status(409).json({ code: "EMAIL_REGISTERED" });
    }

    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: normalizedUsername, mode: "insensitive" } },
    });
    if (existingUsername) {
      return res.status(409).json({ code: "USERNAME_USED" });
    }

    // Contraseña aleatoria: el usuario solo entrará con Google
    const passwordHash = await bcrypt.hash(
      crypto.randomUUID() + Date.now(),
      10,
    );

    const user = await prisma.user.create({
      data: {
        email,
        username: normalizedUsername,
        realName,
        passwordHash,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        realName: user.realName,
      },
    });
  } catch (err) {
    console.error("Google register error:", err);
    return res.status(401).json({ code: "INVALID_CREDENTIALS" });
  }
}
