import e from "express";

import { likeBlog } from "../controllers/likeControllers";

import { verifyToken } from "../middleware/authMiddleware";

const router = e.Router();

router.post("/:blogId", verifyToken, likeBlog);

export default router;
