import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { searchUser } from "../controllers/user.controller";

const router = Router();

router.get("/search", authMiddleware, searchUser);

export default router;
