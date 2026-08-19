import e from "express";
import { SaveBlog, getSavedBlogs } from "../controllers/blogSaveControllers.js";
import { authorizeRoles, verifyToken } from "../middleware/authMiddleware.js";

const router = e.Router();

router.post("/", verifyToken, authorizeRoles("user"), SaveBlog);
router.get("/get", verifyToken, authorizeRoles("user"), getSavedBlogs);

export default router;
