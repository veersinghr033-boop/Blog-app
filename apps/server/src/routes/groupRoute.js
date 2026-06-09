import e from "express"
import { createGroup, getGroups } from "../controllers/groupControllers.js";
import { verifyToken } from "../middleware/authMiddleware.js"


const router = e.Router()
router.post("/create", verifyToken, createGroup)
router.get("/", verifyToken, getGroups)

export default router