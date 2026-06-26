import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.ts";
import authRoutes from "./src/routes/authRoutes.ts";
import blogRoutes from "./src/routes/blogRoutes.ts";
import likeRoutes from "./src/routes/likeRoute.ts";
import commentRoutes from "./src/routes/commentRoutes.ts";
import openAiRoute from "./src/routes/openAiRoute.ts";
import blogSaveRoute from "./src/routes/BlogSaveRoute.ts";
import userRoute from "./src/routes/userRoute.ts";
import reportRoute from "./src/routes/ReportRoute.ts";
import chatRoute from "./src/routes/chatRoute.ts";
import viewRoute from "./src/routes/viewRoute.ts";
import replyRoute from "./src/routes/replyRoute.ts";
import groupRoute from "./src/routes/groupRoute.ts";
import { apiLimiter } from "./src/middleware/rateLimiter.ts";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./src/socket/socket.ts";
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
app.use("/api/groups", groupRoute);
server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});