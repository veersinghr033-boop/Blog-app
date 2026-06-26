import e from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authControllers.ts";
import { verifyToken } from "../middleware/authMiddleware.ts";
import { authLimiter } from "../middleware/rateLimiter.ts";

const router = e.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", verifyToken, logoutUser);
export default router;
