import e from "express";
import { verifyToken } from "../middleware/authMiddleware"
import { addView } from "../controllers/ViewControllers";

const router = e.Router();

router.post("/:blogId", verifyToken, addView);

export default router;
