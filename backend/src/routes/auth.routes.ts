import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  googleAuth,
  googleCompleteRegistration,
} from "../controllers/google.controller";

const router = Router();

// Endpoints from /auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.post("/google", googleAuth);
router.post("/google/complete", googleCompleteRegistration);

export default router;
