import e from "express";

import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  findByBlogId,
  getAllBlogsData
} from "../controllers/blogControllers.ts";
import { upload } from "../middleware/multer.ts"; 
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.ts";

const router = e.Router();

router.get("/all", verifyToken, getAllBlogs);
router.get("/all-data", verifyToken, getAllBlogsData);
// router.post("/create", verifyToken, authorizeRoles("user"), createBlog);
router.post(
  "/create",
  verifyToken,
  upload.single("image"),
  createBlog
);
router.get("/:id", verifyToken, authorizeRoles("user"), getBlogById);

router.delete("/delete/:id", verifyToken, authorizeRoles("user"), deleteBlog);
router.get("/find/:blogId", verifyToken, findByBlogId);

export default router;
