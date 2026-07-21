import e from "express";

import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  findByBlogId,
  findtrendingBlogs,
  getAllBlogsData,
  getDataUserBlogs
} from "../controllers/blogControllers";
import { upload } from "../middleware/multer";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware";

const router = e.Router();

router.get(
  "/all",
  (req, res, next) => {
    console.time("verifyToken");
    next();
  },
  verifyToken,
  (req, res, next) => {
    console.timeEnd("verifyToken");
    next();
  },
  getAllBlogs
); router.get("/all-data", verifyToken, getAllBlogsData);
router.get("/user-blogs", verifyToken, getDataUserBlogs);
router.get("/trending", verifyToken, findtrendingBlogs);
// router.post("/create", verifyToken, authorizeRoles("user"), createBlog);
router.post(
  "/create",
  verifyToken,
  upload.single("image"),
  createBlog as unknown as e.RequestHandler,
);
router.get("/:id", verifyToken, authorizeRoles("user"), getBlogById);

router.delete("/delete/:id", verifyToken, authorizeRoles("user"), deleteBlog);
router.get("/find/:blogId", verifyToken, findByBlogId);

export default router;
