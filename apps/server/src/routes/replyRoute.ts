import e from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { createReply ,getRepliesByCommentId} from "../controllers/replyControllers";

const router = e.Router();

router.post("/:commentId", verifyToken, createReply);
router.get("/:commentId", verifyToken, getRepliesByCommentId);
export default router;