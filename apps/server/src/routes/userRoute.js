import e from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  getUsersSorted,
  saveFcmToken,
  updateUserProfile,
  changeUserPassword,
} from "../controllers/userConlrollers.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.get("/", verifyToken, getAllUsers);
router.get("/users/sorted", verifyToken, getUsersSorted);
router.post("/save-fcm-token", verifyToken, saveFcmToken);
router.put("/profile", verifyToken, updateUserProfile);
router.put("/change-password", verifyToken, changeUserPassword);
router.get("/:id", verifyToken, getUserById);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteUser);

export default router;
