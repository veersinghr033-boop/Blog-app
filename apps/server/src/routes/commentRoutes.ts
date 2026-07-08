import e from "express";

import {
  createComment,
  getCommentsByBlogId,
  deleteComment
} from "../controllers/commentControllers.ts";

import { verifyToken } from "../middleware/authMiddleware.ts";

const router = e.Router();

router.post(
  "/:blogId",
  verifyToken,
  createComment as unknown as e.RequestHandler)

router.get("/:blogId",verifyToken, getCommentsByBlogId);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
