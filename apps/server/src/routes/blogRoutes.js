import e from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
} from "../controllers/blogControllers.js";
const router = e.Router();

router.post("/create", createBlog);
router.get("/all", getAllBlogs);
router.get("/:id", getBlogById);
export default router;