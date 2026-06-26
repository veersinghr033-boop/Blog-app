import e from "express";
import { SaveBlog ,getSavedBlogs } from "../controllers/blogSaveControllers.ts";
import {authorizeRoles ,verifyToken} from "../middleware/authMiddleware.ts";

const router = e.Router();

router.post("/", verifyToken, authorizeRoles("reader"), SaveBlog);
router.get("/get", verifyToken, authorizeRoles("reader"), getSavedBlogs);

export default router;
