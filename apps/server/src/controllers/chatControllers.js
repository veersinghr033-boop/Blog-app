import Chat from "../models/chatModel.js";
import Message from "../models/message.js";
import Group from "../models/GroupModel.js";
import User from "../models/UsersModel.js";
import { emitSortedUsers } from "./userConlrollers.js";

export const getMessages = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    const participants = [senderId, receiverId].sort();

    const chat = await Chat.findOne({
      participants,
      isGroupChat: false,
    });

    if (!chat) {
      return res.json([]);
    }

    const messages = await Message.find({
      chatId: chat._id,
    })
      .populate("senderId", "userName")
      .populate("readBy", "userName")
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error fetching messages",
    });
  }
};
export const createChat = async (req, res) => {
  try {
    const { senderId, receiverId, groupId, message } = req.body;

    if (!senderId || !message) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const io = req.app.get("io");

    if (groupId) {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }
      const chat = await Chat.findById({
        _id: group.chatId,
      });

      const newMsg = await Message.create({
        senderId,
        chatId: chat._id,
        message,
        isRead: false,
        readBy: [],
      });
      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: newMsg._id,
        updatedAt: new Date(),
      });
      const allMembers = await Chat.findById(chat._id).populate(
        "participants",
        "_id",
      );

      // const unRead =
      const senderUser = await User.findById(senderId).select("userName");

      io.to(groupId).emit("receiveGroupMessage", {
        _id: newMsg._id,
        senderId: {
          _id: senderId,
          userName: senderUser.userName,
        },
        chatId: chat._id,
        groupId,
        message,
        timestamp: newMsg.timestamp,
        isRead: false,
        readBy: [],
      });

      const receiverIds = (allMembers.participants || [])
        .map((participant) => participant._id.toString())
        .filter(
          (participantId) =>
            participantId && participantId !== senderId.toString(),
        );

      receiverIds.forEach(async (receiverId) => {
        io.to(receiverId).emit("newNotification", {
          senderId,
          senderName: senderUser.userName || "Someone",
          groupName: group.name || "Group",
          groupId,
          receiverId,
          message,
          type: "group",
          timestamp: newMsg.timestamp,
        });
        await emitSortedUsers(io, receiverId);
      });

      return res.status(201).json({
        message: "Group message sent",
        chatId: chat._id,
        newMsg,
      });
    }

    const participants = [senderId, receiverId].sort();

    let chat = await Chat.findOne({
      participants,
      isGroupChat: false,
    });

    if (!chat) {
      chat = await Chat.create({
        participants,
        isGroupChat: false,
      });
    }

    const newMsg = await Message.create({
      senderId,
      chatId: chat._id,
      message,
      isRead: false,
      readBy: [],
    });

    await Chat.findByIdAndUpdate(chat._id, {
      lastMessage: newMsg._id,
      updatedAt: new Date(),
    });

    const room = participants.join("_");
    const senderUser = await User.findById(senderId).select("userName");

    io.to(room).emit("receiveMessage", {
      _id: newMsg._id,
      senderId: {
        _id: senderId,
        userName: senderUser.userName,
      },
      receiverId,
      message,
      timestamp: newMsg.timestamp,
      isRead: false,
      readBy: [],
    });
    io.to(receiverId).emit("newNotification", {
      senderId,
      senderName: senderUser.userName || "Someone",
      receiverId,
      message,
      type: "private",
      timestamp: newMsg.timestamp,
      isRead: false,
      readBy: [],
    });

    await emitSortedUsers(io, senderId);
    await emitSortedUsers(io, receiverId);

    return res.status(201).json({
      message: "Message sent",
      chatId: chat._id,
      newMsg,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const chat = await Chat.findById(group.chatId);

    if (!chat) {
      return res.json([]);
    }

    const messages = await Message.find({
      chatId: chat._id,
    })
      .populate("senderId", "userName")
      .populate("readBy", "userName")
      .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "server error",
    });
  }
};
// export const markMessagesAsRead = async (req, res) => {
//   try {
//     const { receiverId, groupId } = req.body;
//     const userId = req.user.id;
//     const io = req.app.get("io");

//     let chat;

//     if (groupId) {
//       const group = await Group.findById(groupId);

//       if (!group) {
//         return res.status(404).json({
//           message: "Group not found",
//         });
//       }

//       chat = await Chat.findById(group.chatId);

//       if (!chat) {
//         return res.status(404).json({
//           message: "Chat not found",
//         });
//       }
//     } else if (receiverId) {
//       const participants = [userId, receiverId].sort();

//       chat = await Chat.findOne({
//         participants,
//         isGroupChat: false,
//       });

//       if (!chat) {
//         return res.status(404).json({
//           message: "Chat not found",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         message: "Missing receiverId or groupId",
//       });
//     }

//     const unreadMessages = await Message.find({
//       chatId: chat._id,
//       senderId: { $ne: userId },
//       readBy: { $ne: userId },
//     }).select("_id senderId");

//     if (!unreadMessages.length) {
//       return res.status(200).json({
//         message: "No unread messages",
//       });
//     }

//     await Message.updateMany(
//       {
//         _id: {
//           $in: unreadMessages.map((m) => m._id),
//         },
//       },
//       {
//         $addToSet: {
//           readBy: userId,
//         },
//       },
//     );

//     const reader = await User.findById(userId).select("userName");
//     const chatRoom = groupId
//       ? groupId
//       : chat.participants
//           .map((participant) => participant.toString())
//           .sort()
//           .join("_");

//     const senderIds = [
//       ...new Set(unreadMessages.map((m) => m.senderId.toString())),
//     ];

//     const payload = {
//       chatId: chat._id,
//       reader: {
//         _id: reader._id,
//         userName: reader.userName,
//       },
//       messageIds: unreadMessages.map((m) => m._id.toString()),
//     };

//     senderIds.forEach((senderId) => {
//       io.to(senderId).emit("messagesRead", {
//         ...payload,
//         messageIds: unreadMessages
//           .filter((m) => m.senderId.toString() === senderId)
//           .map((m) => m._id.toString()),
//       });
//     });

//     io.to(chatRoom).emit("messagesRead", payload);

//     return res.status(200).json({
//       message: "Messages marked as read",
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       message: "server error",
//     });
//   }
// };
// const notifications = async (req, res) => {
//   try {
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "server error" });
//   }
// };
