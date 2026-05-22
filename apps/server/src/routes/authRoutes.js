import e from "express";
import { registerUser, loginUser } from "../controllers/authControllers.js";

const router = e.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
