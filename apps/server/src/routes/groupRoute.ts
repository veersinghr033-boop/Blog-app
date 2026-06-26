import e from "express";
import {
    createGroup,
    getGroups,
    deleteById,
    groupDelete,
    updateGroupMembers,
    changeAdmin,
} from "../controllers/groupControllers.ts";
import { verifyToken } from "../middleware/authMiddleware.ts";

const router = e.Router();
router.post("/create", verifyToken, createGroup);
router.get("/:groupId", verifyToken, getGroups);
router.delete("/:userId", verifyToken, deleteById);
router.delete("/group/:groupId", verifyToken, groupDelete)
router.put("/update-members/:groupId", verifyToken, updateGroupMembers)
router.put("/admin/:groupId", verifyToken, changeAdmin)

export default router;