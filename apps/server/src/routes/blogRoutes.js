import e from "express";

import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  findByBlogId,
} from "../controllers/blogControllers.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.get("/all", verifyToken, getAllBlogs);

router.post("/create", verifyToken, authorizeRoles("reader"), createBlog);

router.get("/:id", verifyToken, authorizeRoles("reader"), getBlogById);

router.delete("/delete/:id", verifyToken, authorizeRoles("reader"), deleteBlog);
router.get("/find/:blogId", verifyToken, findByBlogId);

export default router;
