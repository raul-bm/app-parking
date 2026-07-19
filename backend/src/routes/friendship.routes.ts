import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  acceptFriendRequest,
  listFriends,
  listPendingRequests,
  listSentRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../controllers/friendship.controller";

const router = Router();

// Endpoints from /friendships
router.post("/request/:userId", authMiddleware, sendFriendRequest);
router.patch("/:id/accept", authMiddleware, acceptFriendRequest);
router.patch("/:id/reject", authMiddleware, rejectFriendRequest);
router.get("/", authMiddleware, listFriends);
router.get("/pending", authMiddleware, listPendingRequests);
router.get("/sent", authMiddleware, listSentRequests);
router.delete("/:id", authMiddleware, removeFriend);

export default router;
