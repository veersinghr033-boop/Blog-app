import e from "express";
import { verifyToken } from "../middleware/authMiddleware.ts"
import { addView } from "../controllers/ViewControllers.ts";

const router = e.Router();

router.post("/:blogId", verifyToken, addView);

export default router;
