import e from "express";
import {
    createGroup,
    getGroups,
    deleteById,
    groupDelete,
    updateGroupMembers,
    changeAdmin,
    removeAdmin,
    // ,updateGroupImage
    updateGroup
} from "../controllers/groupControllers";
import { verifyToken } from "../middleware/authMiddleware";
import { upload } from "../middleware/multer"; 

const router = e.Router();
router.post("/create", upload.single("groupImage"), verifyToken, createGroup);
router.get("/:groupId", verifyToken, getGroups);
router.delete("/:userId", verifyToken, deleteById);
router.delete("/group/:groupId", verifyToken, groupDelete)
router.put("/update-members/:groupId", verifyToken, updateGroupMembers)
router.put("/admin/:groupId", verifyToken, changeAdmin)
router.put("/remove-admin/:groupId", verifyToken, removeAdmin)
// router.put(
//     "/image/:groupId",
//     verifyToken,
//     upload.single("groupImage"),
//     updateGroupImage
// );
router.put(
    "/:groupId",
    verifyToken,
    upload.single("groupImage"),
    updateGroup
);

export default router;