import { Server } from "socket.io";
import { emitSortedUsers } from "../controllers/userConlrollers.ts";
import User from "../models/UsersModel.ts";
import Chat from "../models/chatModel.ts";
import Group from "../models/GroupModel.ts";
import Message from "../models/message.ts";

const socketToUser = new Map();
const userStatus = new Map();
interface Payload {
  user1: string;
  user2: string;
}
const buildRoomName = (...parts: Array<unknown>) => {
  return parts
    .filter((part): part is string | number | { toString(): string } => part !== undefined && part !== null)
    .map((part) => String(part))
    .sort()
    .join("_");
};

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.sockets.on("connection", (socket:any) => {
    const setUserOffline = (userId: string) => {
      if (!userId) return;

      userStatus.set(userId, "offline");
      socketToUser.delete(socket.id);

      io.sockets.emit("userStatus", {
        userId,
        status: "offline",
      });
    };

    socket.on("userOnline", async (userId:string) => {
      console.log("userOnline:", userId);

      userStatus.set(userId, "online");
      socketToUser.set(socket.id, userId);

      socket.join(userId);

      io.sockets.emit("userStatus", {
        userId,
        status: "online",
      });

      await emitSortedUsers(io, userId);
    });

    socket.on("userAway", (userId:string) => {
      userStatus.set(userId, "away");

      io.sockets.emit("userStatus", {
        userId,
        status: "away",
      });
    });

    socket.on("userOffline", (userId:string) => {
      setUserOffline(userId);
    });

    socket.on("joinRoom", (payload: Payload | string) => {
      const room =
        typeof payload === "string"
          ? payload
          : buildRoomName(payload?.user1, payload?.user2);

      socket.join(room);
    });

    socket.on("leaveRoom", (payload: Payload | string) => {
      const room =
        typeof payload === "string"
          ? payload
          : buildRoomName(payload?.user1, payload?.user2);

      socket.leave(room);
    });

    socket.on("joinGroup", (groupId: string) => {
      socket.join(groupId);
    });

    socket.on("leaveGroup", (groupId: string) => {
      socket.leave(groupId);
    });
    socket.on("typing", ({ senderId, receiverId, groupId }:{senderId: string, receiverId: string, groupId: string}) => {
      if (groupId && typeof senderId === 'string') {
        socket.to(groupId).emit("userTyping", {
          userId: senderId,
          chatId: groupId,
        });
        return;
      }

      const room = buildRoomName(senderId, receiverId);

      socket.to(room).emit("userTyping", {
        userId: senderId,
        chatId: room,
      });
    });

    socket.on("stopTyping", ({ senderId, receiverId, groupId }: { senderId: string, receiverId: string, groupId: string }) => {
      if (groupId && typeof senderId === 'string') {
        socket.to(groupId).emit("userStopTyping", {
          userId: senderId,
          chatId: groupId,
        });
        return;
      }

      const room = buildRoomName(senderId, receiverId);

      socket.to(room).emit("userStopTyping", {
        userId: senderId,
        chatId: room,
      });
    });

    socket.on("readMessages", async ({ chatId, userId }:{chatId: string, userId: string}) => {
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
          buildRoomName(...chat.participants.map((participant) => participant.toString()));

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
            _id: reader?._id,
            userName: reader?.userName,
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
        try {
          if (payload?.reader?._id) {
            await emitSortedUsers(io, payload.reader._id.toString());
          }

          for (const sid of senderIds) {
            await emitSortedUsers(io, sid);
          }
        } catch (err) {
          console.error('Failed to emit sorted users after readMessages', err);
        }
      } catch (error) {
        console.error(error);
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
