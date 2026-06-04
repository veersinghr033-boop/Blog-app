import e from "express";
import { verifyToken } from "../middleware/authMiddleware.js"
import { addView } from "../controllers/viewControllers.js";

const router = e.Router();

router.post("/:blogId", verifyToken, addView);

export default router;
