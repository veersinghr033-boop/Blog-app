import * as e from "express";
import {
    createReport,
    getReports,
    getReportById,
    deleteReport,
    getByUserId
} from "../controllers/ReportControllers.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.post("/", verifyToken, authorizeRoles("user", "admin"), createReport);
router.get("/", verifyToken, authorizeRoles("admin"), getReports);
router.get("/report", verifyToken, authorizeRoles("user"), getReportById);
router.delete("/:id", verifyToken, authorizeRoles("admin", "user"), deleteReport);
router.get("/user/:blogId", verifyToken, authorizeRoles("user", "admin"), getByUserId);

export default router;