import e from "express";

import { likeBlog } from "../controllers/likeControllers.js";

import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.post("/:blogId", verifyToken, likeBlog);

export default router;
