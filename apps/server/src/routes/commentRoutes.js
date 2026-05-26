import e from "express";

import {
  createComment,
  getCommentsByBlogId,
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

export default router;
