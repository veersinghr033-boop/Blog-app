import e from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
} from "../controllers/userConlrollers.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteUser);

export default router;
