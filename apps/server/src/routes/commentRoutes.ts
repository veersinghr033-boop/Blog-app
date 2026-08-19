import e from "express";

import {
  createComment,
  getCommentsByBlogId,
  deleteComment
} from "../controllers/commentControllers.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = e.Router();

router.post(
  "/:blogId",
  verifyToken,
  createComment as unknown as e.RequestHandler)

router.get("/:blogId",verifyToken, getCommentsByBlogId);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
