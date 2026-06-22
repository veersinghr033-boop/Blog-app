import Chat from "../models/chatModel.js";
import Message from "../models/message.js";
import Group from "../models/GroupModel.js";
import User from "../models/UsersModel.js";
import { emitSortedUsers } from "./userConlrollers.js";
import { sendPushNotification } from "../utils/sendPushNotification.js";

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
        "_id fcmToken",
      );

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

      const groupTokens = [...new Set(
        (allMembers.participants || [])
          .filter(
            (participant) => participant._id.toString() !== senderId.toString(),
          )
          .map((participant) => participant.fcmToken)
          .filter(Boolean),
      )];

      if (groupTokens.length) {
        await sendPushNotification({
          tokens: groupTokens,
          title: `${senderUser.userName || "Someone"} posted in ${group.name || "a group"}`,
          body: message,
          data: {
            type: "group",
            senderId,
            groupId,
            groupName: group.name,
            message,
            timestamp: newMsg.timestamp,
          },
        });
      }

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

    const receiver = await User.findById(receiverId).select("fcmToken");

    if (receiver?.fcmToken) {
      await sendPushNotification({
        token: receiver.fcmToken,
        title: `New message from ${senderUser.userName || "Someone"}`,
        body: message,
        data: {
          type: "private",
          senderId,
          receiverId,
          message,
          timestamp: newMsg.timestamp,
        },
      });
    }

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
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        message: "Missing messageId parameter",
      });
    }

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({
        message: "Message not found",
      });
    }
    const io = req.app.get("io");
    io.to;
    res.status(200).json({
      message: "message deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "server error",
    });
  }
};
