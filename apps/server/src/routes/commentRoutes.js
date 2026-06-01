import e from "express";

import {
  createComment,
  getCommentsByBlogId,
  deleteComment
} from "../controllers/commentControllers.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.post(
  "/:blogId",
  verifyToken,
  // authorizeRoles("reader", "admin"),
  createComment,
);

router.get("/:blogId",verifyToken, getCommentsByBlogId);
router.delete("/:commentId", verifyToken, deleteComment);

export default router;
