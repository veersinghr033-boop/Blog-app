import e from "express";
import { generateBlog } from "../controllers/openAiControllers.js";

const router = e.Router();

router.post("/generate", generateBlog);

export default router;
    