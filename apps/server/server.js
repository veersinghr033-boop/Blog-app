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
import userRoute from "./src/routes/userRoute.js";
import reportRoute from "./src/routes/RepotRoute.js";
import chatRoute from "./src/routes/chatRoute.js";
import viewRoute from "./src/routes/viewRoute.js";
import replyRoute from "./src/routes/replyRoute.js";
import { apiLimiter } from "./src/middleware/rateLimiter.js";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./src/socket/socket.js";

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = initSocket(server);

app.set("io", io);

app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);
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
app.use("/api/users", userRoute);
app.use("/api/reports", reportRoute);
app.use("/api", chatRoute);
app.use("/api/views", viewRoute);
app.use("/api/replies", replyRoute);
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
