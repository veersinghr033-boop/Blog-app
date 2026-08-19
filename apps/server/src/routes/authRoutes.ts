import e from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authControllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = e.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", verifyToken, logoutUser);
export default router;
