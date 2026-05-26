import e from "express";
import { SaveBlog ,getSavedBlogs } from "../controllers/blogSaveControllers.js";
import {authorizeRoles ,verifyToken} from "../middleware/authMiddleware.js";

const router = e.Router();

router.post("/", verifyToken, authorizeRoles("reader"), SaveBlog);
router.get("/get", verifyToken, authorizeRoles("reader"), getSavedBlogs);

export default router;
