import e from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createReply, getRepliesByCommentId } from "../controllers/replyControllers.js";

const router = e.Router();

router.post("/:commentId", verifyToken, createReply);
router.get("/:commentId", verifyToken, getRepliesByCommentId);
export default router;