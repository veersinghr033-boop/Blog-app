import express from "express";
import { generateBlog } from "../controllers/openAiControllers.ts";

const router = express.Router();

router.post("/generate", generateBlog);

export default router;
    