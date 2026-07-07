import express from "express";
import {
  createChat,
  getMessages,
  getGroupMessages,
  deleteMessage,
} from "../controllers/chatControllers.ts";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.ts";

const router = express.Router();

router.post("/chat", verifyToken, authorizeRoles("user"), createChat);
router.get(
  "/chat/:receiverId",
  verifyToken,
  authorizeRoles("user"),
  getMessages
);
router.get(
  "/chat/group-messages/:groupId",
  verifyToken,
  authorizeRoles("user"),
  getGroupMessages,
);
router.delete(
  "/chat/message/:messageId",
  verifyToken,
  authorizeRoles("user"),
  deleteMessage,
);
export default router;
