import e from "express";
import {
    createGroup,
    getGroups,
    deleteById,
    groupDelete
} from "../controllers/groupControllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = e.Router();
router.post("/create", verifyToken, createGroup);
router.get("/:groupId", verifyToken, getGroups);
router.delete("/:userId", verifyToken, deleteById);
router.delete("/group/:groupId", verifyToken, groupDelete)

export default router;