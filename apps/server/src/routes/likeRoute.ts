import e from "express";

import { likeBlog } from "../controllers/likeControllers.ts";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.ts";

const router = e.Router();

router.post("/:blogId", verifyToken, likeBlog);

export default router;
