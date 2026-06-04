import e from "express";
import {
  createReport,
  getReports,
  getReportById,
  deleteReport,
  getByUserId
} from "../controllers/RepotControllers.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.post("/", verifyToken, authorizeRoles("reader", "admin"), createReport);
router.get("/", verifyToken, authorizeRoles("admin"), getReports);
router.get("/report", verifyToken, authorizeRoles("reader"), getReportById);
router.delete("/:id", verifyToken, authorizeRoles("admin", "reader"), deleteReport);
router.get("/user/:blogId", verifyToken, authorizeRoles("reader", "admin"), getByUserId);

export default router;
