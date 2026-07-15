import e from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authControllers";
import { verifyToken } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/rateLimiter";

const router = e.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", verifyToken, logoutUser);
export default router;
