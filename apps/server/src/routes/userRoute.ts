import e from "express";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  getUsersSorted,
  saveFcmToken,
  updateUserProfile,
  changeUserPassword,
  getAllUsersData
} from "../controllers/userConlrollers";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware";
import { upload } from "../middleware/multer";

const router = e.Router();

router.get("/", verifyToken, getAllUsers);
router.get("/all-data", verifyToken, getAllUsersData);
router.get("/users/sorted", verifyToken, getUsersSorted);
router.post("/save-fcm-token", verifyToken, saveFcmToken);
router.put(
  "/profile",
  verifyToken,
  upload.single("image"),
  updateUserProfile as unknown as e.RequestHandler,
);
router.put("/change-password", verifyToken, changeUserPassword);
router.get("/:id", verifyToken, getUserById);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteUser);

export default router;
