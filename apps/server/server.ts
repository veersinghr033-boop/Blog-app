import express from "express";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db";
import authRoutes from "./src/routes/authRoutes";
import blogRoutes from "./src/routes/blogRoutes";
import likeRoutes from "./src/routes/likeRoute";
import commentRoutes from "./src/routes/commentRoutes";
import openAiRoute from "./src/routes/openAiRoute";
import blogSaveRoute from "./src/routes/BlogSaveRoute";
import userRoute from "./src/routes/userRoute";
import reportRoute from "./src/routes/ReportRoute";
import chatRoute from "./src/routes/chatRoute";
import viewRoute from "./src/routes/viewRoute";
import replyRoute from "./src/routes/replyRoute";
import groupRoute from "./src/routes/groupRoute";
import { apiLimiter } from "./src/middleware/rateLimiter";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./src/socket/socket";
dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = initSocket(server);

app.set("io", io);

app.use(express.json());
app.use(cookieParser());
app.use(compression());
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

const PORT = Number(process.env.PORT) || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
    if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Please free the port or update PORT in your .env file.`);
        process.exit(1);
    }
    throw error;
});