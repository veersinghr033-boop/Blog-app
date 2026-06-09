import { Server } from "socket.io";
import { emitSortedUsers } from "../controllers/userConlrollers.js";

const socketToUser = new Map();
const userStatus = new Map();

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        const setUserOffline = (userId) => {
            if (!userId) return;

            userStatus.set(userId, "offline");
            socketToUser.delete(socket.id);

            io.emit("userStatus", {
                userId,
                status: "offline",
            });
        };

        socket.on("userOnline", async(userId) => {
            userStatus.set(userId, "online");
            socketToUser.set(socket.id, userId);

            socket.join(userId);

            io.emit("userStatus", {
                userId,
                status: "online",
            });

            await emitSortedUsers(io, userId);
        });

        socket.on("userAway", (userId) => {
            userStatus.set(userId, "away");

            io.emit("userStatus", {
                userId,
                status: "away",
            });
        });

        socket.on("userOffline", (userId) => {
            setUserOffline(userId);
        });

        socket.on("joinRoom", ({ user1, user2 }) => {
            const room = [user1, user2].sort().join("_");

            socket.join(room);
        });

        socket.on("leaveRoom", ({ user1, user2 }) => {
            const room = [user1, user2].sort().join("_");

            socket.leave(room);
        });

        socket.on("joinGroup", (groupId) => {
            socket.join(groupId);
        });

        socket.on("leaveGroup", (groupId) => {
            socket.leave(groupId);
        });

        socket.on("disconnect", () => {
            const userId = socketToUser.get(socket.id);

            if (userId) {
                setUserOffline(userId);
            }
        });
    });

    return io;
};