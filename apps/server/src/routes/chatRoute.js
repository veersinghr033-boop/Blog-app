import express from "express";
import {
  createChat,
  getMessages,
  getGroupMessages,
  deleteMessage,
} from "../controllers/chatControllers.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", verifyToken, authorizeRoles("reader"), createChat);
router.get(
  "/chat/:receiverId",
  verifyToken,
  authorizeRoles("reader"),
  getMessages,
);
router.get(
  "/chat/group-messages/:groupId",
  verifyToken,
  authorizeRoles("reader"),
  getGroupMessages,
);
router.delete(
  "/chat/message/:messageId",
  verifyToken,
  authorizeRoles("reader"),
  deleteMessage,
);
// router.put("/read", verifyToken, authorizeRoles("reader"), markMessagesAsRead);
export default router;
