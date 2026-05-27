import e from "express"
import { createReport , getReports } from "../controllers/RepotControllers.js"
import { verifyToken , authorizeRoles } from "../middleware/authMiddleware.js"

const router = e.Router()

router.post("/", verifyToken, authorizeRoles("reader", "admin"), createReport)
router.get("/", verifyToken, authorizeRoles("admin"), getReports)

export default router
