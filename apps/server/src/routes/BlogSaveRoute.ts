import e from "express";
import { SaveBlog, getSavedBlogs } from "../controllers/blogSaveControllers.ts";
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.ts";

const router = e.Router();

router.post("/", verifyToken, authorizeRoles("user"), SaveBlog);
router.get("/get", verifyToken, authorizeRoles("user"), getSavedBlogs);

export default router;
