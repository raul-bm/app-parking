import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  addGroupMember,
  createGroup,
  deleteGroup,
  getMyGroups,
  getSpecificGroup,
  removeGroupMember,
} from "../controllers/group.controller";

const router = Router();

// Endpoints from /groups
router.post("/", authMiddleware, createGroup);
router.get("/", authMiddleware, getMyGroups);
router.get("/:id", authMiddleware, getSpecificGroup);
router.delete("/:id", authMiddleware, deleteGroup);
router.post("/:id/members", authMiddleware, addGroupMember);
router.delete("/:id/members/:userId", authMiddleware, removeGroupMember);

export default router;
