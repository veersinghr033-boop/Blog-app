import e from "express";
import { createComment , getCommentsByBlogId } from "../controllers/commentControllers.js";

const router = e.Router();

router.post("/:blogId", createComment);
router.get("/:blogId", getCommentsByBlogId);

export default router;