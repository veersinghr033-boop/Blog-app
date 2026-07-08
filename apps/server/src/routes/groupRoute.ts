import e from "express";
import {
    createGroup,
    getGroups,
    deleteById,
    groupDelete,
    updateGroupMembers,
    changeAdmin,
    removeAdmin
} from "../controllers/groupControllers.ts";
import { verifyToken } from "../middleware/authMiddleware.ts";

const router = e.Router();
router.post("/create", verifyToken, createGroup);
router.get("/:groupId", verifyToken, getGroups);
router.delete("/:userId", verifyToken, deleteById);
router.delete("/group/:groupId", verifyToken, groupDelete)
router.put("/update-members/:groupId", verifyToken, updateGroupMembers)
router.put("/admin/:groupId", verifyToken, changeAdmin)
router.put("/remove-admin/:groupId", verifyToken, removeAdmin)

export default router;