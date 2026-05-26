import e from "express";

import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
} from "../controllers/blogControllers.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.get("/all", verifyToken, getAllBlogs);

router.post("/create", verifyToken, authorizeRoles("author"), createBlog);

router.get("/:id", verifyToken, authorizeRoles("author"), getBlogById);

router.delete("/delete/:id", verifyToken, authorizeRoles("author"), deleteBlog);

export default router;
