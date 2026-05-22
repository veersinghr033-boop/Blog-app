import e from "express";
import { likeBlog  } from "../controllers/likeControllers.js";

const router = e.Router();

router.post("/:blogId", likeBlog);

export default router;