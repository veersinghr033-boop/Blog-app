import { Server } from "socket.io";
import { emitSortedUsers } from "../controllers/userConlrollers.js";
import User from "../models/UsersModel.js";
import Chat from "../models/chatModel.js";
import Group from "../models/GroupModel.js";
import Message from "../models/message.js";

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

    socket.on("userOnline", async (userId) => {

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
    socket.on("typing", ({ senderId, receiverId, groupId }) => {
      if (groupId) {
        socket.to(groupId).emit("userTyping", {
          userId: senderId,
          chatId: groupId,
        });
        return;
      }

      const room = [senderId, receiverId].sort().join("_");

      socket.to(room).emit("userTyping", {
        userId: senderId,
        chatId: room,
      });
    });

    socket.on("stopTyping", ({ senderId, receiverId, groupId }) => {
      if (groupId) {
        socket.to(groupId).emit("userStopTyping", {
          userId: senderId,
          chatId: groupId,
        });
        return;
      }

      const room = [senderId, receiverId].sort().join("_");

      socket.to(room).emit("userStopTyping", {
        userId: senderId,
        chatId: room,
      });
    });

    socket.on("readMessages", async ({ chatId, userId }) => {
      try {
        const chat = await Chat.findById(chatId);

        if (!chat) return;

        const unreadMessages = await Message.find({
          chatId,
          senderId: { $ne: userId },
          readBy: { $ne: userId },
        }).select("_id senderId");

        if (!unreadMessages.length) return;

        await Message.updateMany(
          {
            _id: {
              $in: unreadMessages.map((m) => m._id),
            },
            senderId: { $ne: userId },
          },
          {
            $addToSet: {
              readBy: userId,
            },
          },
        );

        const reader = await User.findById(userId).select("userName");
        const group = await Group.findOne({ chatId }).select("_id");
        const groupRoom = group && group._id ? group._id.toString() : null;
        const chatRoom =
          groupRoom ||
          chat.participants
            .map((participant) => participant.toString())
            .sort()
            .join("_");

        const senderIds = [
          ...new Set(
            unreadMessages
              .map((m) => m.senderId.toString())
              .filter((id) => id !== userId.toString()),
          ),
        ];

        const payload = {
          chatId,
          reader: {
            _id: reader._id,
            userName: reader.userName,
          },
          messageIds: unreadMessages.map((m) => m._id.toString()),
        };

        senderIds.forEach((senderId) => {
          io.to(senderId).emit("messagesRead", {
            ...payload,
            messageIds: unreadMessages
              .filter((m) => m.senderId.toString() === senderId)
              .map((m) => m._id.toString()),
          });
        });

        if (chatRoom) {
          io.to(chatRoom).emit("messagesRead", payload);
        }
      } catch (error) {
        console.log(error);
      }
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
