import e from "express"
import { createGroup } from "../controllers/groupControllers.js"
import { verifyToken } from "../middleware/authMiddleware.js"


const router = e.Router()
router.post("/create", verifyToken, createGroup)

export default router