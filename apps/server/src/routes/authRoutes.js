import e from "express";
import { registerUser, loginUser ,logoutUser } from "../controllers/authControllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = e.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
export default router;
