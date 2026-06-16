import express from "express";
import {
    createChat,
    getMessages,
    getGroupMessages,
    markMessagesAsRead,
} from "../controllers/chatControllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", verifyToken, createChat);
router.get("/chat/:receiverId", verifyToken, getMessages);
router.get("/chat/group-messages/:groupId", verifyToken, getGroupMessages);
router.put("/read", verifyToken, markMessagesAsRead);
export default router;