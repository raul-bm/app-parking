import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

export interface AuthenticatedRequest extends AuthRequest {
  userId: number;
}

// Function to know if the user it's authenticated
export function ensureAuthenticated(
  req: AuthRequest,
  res: Response,
): req is AuthenticatedRequest {
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }

  return true;
}
