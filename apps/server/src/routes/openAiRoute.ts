import e from "express";
import { generateBlog } from "../controllers/openAiControllers.ts";

const router = e.Router();

router.post("/generate", generateBlog);

export default router;
    