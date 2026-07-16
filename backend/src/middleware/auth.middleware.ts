import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

interface TokenPayload {
  userId: number;
}

// Middleware with authentication, used for the most endpoints to know if the user is logged and to check if the user is the owner of pins, etc
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Get the token from the header (token is used for authorize when the user is already logged)
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not set" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Environment variable JWT_SECRET missing");
  }

  // Decode the token (if valid and not expired) to know which userID has
  try {
    const decoded = jwt.verify(token, jwtSecret) as unknown as TokenPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token not valid or expired" });
  }
}
