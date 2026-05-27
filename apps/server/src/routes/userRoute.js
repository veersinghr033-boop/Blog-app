import e from "express";
import { getAllUsers } from "../controllers/userConlrollers.js";
import { verifyToken , authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.get("/", verifyToken, authorizeRoles("admin"), getAllUsers);

export default router;