import { Router } from "express";
import {
  createPin,
  getPins,
  deletePin,
  getSpecificPin,
  getSharedWithMe,
} from "../controllers/pin.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  sharePinWithGroup,
  sharePinWithUser,
  unsharePinWithGroup,
  unsharePinWithUser,
} from "../controllers/share.controller";

const router = Router();

// Endpoints from /pins
router.post("/", authMiddleware, createPin);
router.get("/", authMiddleware, getPins);
router.get("/shared-with-me", authMiddleware, getSharedWithMe);
router.delete("/:id", authMiddleware, deletePin);
router.get("/:id", authMiddleware, getSpecificPin);

// Endpoints for share
router.post("/:id/share/user", authMiddleware, sharePinWithUser);
router.post("/:id/share/group", authMiddleware, sharePinWithGroup);
router.delete("/:id/share/user/:userId", authMiddleware, unsharePinWithUser);
router.delete("/:id/share/group/:groupId", authMiddleware, unsharePinWithGroup);

export default router;
