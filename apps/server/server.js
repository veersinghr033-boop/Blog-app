import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import likeRoutes from "./src/routes/likeRoute.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import openAiRoute from "./src/routes/openAiRoute.js";
import blogSaveRoute from "./src/routes/BlogSaveRoute.js";
import cookieParser from "cookie-parser";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send("Blog API Running");
});
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/openai", openAiRoute);
app.use("/api/blogsave", blogSaveRoute);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
