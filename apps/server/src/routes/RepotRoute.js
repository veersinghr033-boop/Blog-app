import e from "express";
import {
  createReport,
  getReports,
  getReportById,
  deleteReport
} from "../controllers/RepotControllers.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = e.Router();

router.post("/", verifyToken, authorizeRoles("reader", "admin"), createReport);
router.get("/", verifyToken, authorizeRoles("admin"), getReports);
router.get("/report", verifyToken, authorizeRoles("author"), getReportById);
router.delete("/:id", verifyToken, authorizeRoles("admin", "author"), deleteReport);

export default router;
