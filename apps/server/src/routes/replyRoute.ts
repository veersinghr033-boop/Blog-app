import e from "express";
import { verifyToken } from "../middleware/authMiddleware.ts";
import { createReply ,getRepliesByCommentId} from "../controllers/replyControllers.ts";

const router = e.Router();

router.post("/:commentId", verifyToken, createReply);
router.get("/:commentId", verifyToken, getRepliesByCommentId);
export default router;