import mongoose from "mongoose";
import Chat from "../models/chatModel.ts";
import Message from "../models/message.ts";
import Group from "../models/GroupModel.ts";
import User from "../models/UsersModel.ts";
import { emitSortedUsers } from "./userConlrollers.ts";
import { sendPushNotification } from "../utils/sendPushNotification.ts";
import { Request, Response } from "express";

interface Participant {
  _id: string;
  fcmToken?: string;
}

const normalizeBeforeDate = (value: unknown): Date | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const senderId = (req as Request & { user?: { id: string } }).user?.id;

    const receiverIdParam = req.params.receiverId;
    const receiverId = Array.isArray(receiverIdParam)
      ? receiverIdParam[0]
      : receiverIdParam;
    const before = normalizeBeforeDate(req.query.before);
    const limit = Number(req.query.limit ?? 20);

    if (!senderId || typeof receiverId !== "string" || !receiverId) {
      return res.status(400).json({
        message: "Missing sender or receiver id",
      });
    }

    const participants = [
      new mongoose.Types.ObjectId(senderId),
      new mongoose.Types.ObjectId(receiverId),
    ];

    const chat = await Chat.findOne({
      participants: { $all: participants },
      isGroupChat: false,
    });

    if (!chat) {
      return res.json({
        messages: [],
        hasMore: false,
        nextCursor: null,
      });
    }

    const query: {
      chatId: typeof chat._id;
      timestamp?: {
        $lt: Date;
      };
    } = {
      chatId: chat._id,
    };

    if (before) {
      query.timestamp = {
        $lt: before,
      };
    }

    const messages = await Message.find(query)
      .populate("senderId", "userName")
      .populate("readBy", "userName")
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    const reversedMessages = messages.reverse();

    res.status(200).json({
      messages: reversedMessages,
      hasMore: messages.length === Number(limit),
      nextCursor:
        reversedMessages.length > 0 ? reversedMessages[0].timestamp : null,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error fetching messages",
    });
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const {
      senderId,
      receiverId: receiverIdParam,
      groupId,
      message,
    } = req.body as {
      senderId?: string;
      receiverId?: string | string[];
      groupId?: string;
      message?: any;
    };
    console.log("REQ BODY MESSAGE:", req.body.message);
    console.log("TYPE:", typeof req.body.message);
    const receiverId = Array.isArray(receiverIdParam)
      ? receiverIdParam[0]
      : receiverIdParam;

    if (!senderId || !message || (!groupId && typeof receiverId !== "string")) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const io = req.app.get("io");
    function extractText(node: any): string {
      if (!node) return "";

      if (node.text) return node.text;

      if (Array.isArray(node.children)) {
        return node.children.map(extractText).join(" ");
      }

      return "";
    }

    const notificationBody = extractText(message.root);
    if (groupId) {
      const group = await Group.findById(groupId);

      if (!group) {
        return res.status(404).json({
          message: "Group not found",
        });
      }

      const chat = await Chat.findById(group.chatId);

      if (!chat) {
        return res.status(404).json({
          message: "Chat not found",
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

      const allMembers = await Chat.findById(chat._id).populate<{
        participants: Participant[];
      }>("participants", "_id fcmToken");
      console.log(
        allMembers?.participants.map((p) => ({
          id: p._id,
          token: p.fcmToken,
        }))
      );
      const senderUser = await User.findById(senderId).select("userName");
      const senderName = senderUser?.userName || "Someone";

      io.to(groupId).emit("receiveGroupMessage", {
        _id: newMsg._id,
        senderId: {
          _id: senderId,
          userName: senderName,
        },
        chatId: chat._id,
        groupId,
        message,
        timestamp: newMsg.timestamp,
        isRead: false,
        readBy: [],
      });

      const receiverIds = (allMembers?.participants || [])
        .map((participant) => participant._id.toString())
        .filter((participantId) => participantId && participantId !== senderId);
console.log(receiverIds)
      receiverIds.forEach(async (receiverId) => {
        io.to(receiverId).emit("newNotification", {
          senderId,
          senderName,
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
        (allMembers?.participants || [])
          .filter((participant) => participant._id.toString() !== senderId)
          .map((participant) => participant.fcmToken)
          .filter((token): token is string => Boolean(token)),
      )];
      console.log(groupTokens)
      if (groupTokens.length) {
        const pushResult = await sendPushNotification({
          tokens: groupTokens,
          title: `${senderName} posted in ${group.name || "a group"}`,
          body: notificationBody,
          data: {
            type: "group",
            senderId,
            groupId,
            groupName: group.name,
            message,
            timestamp: newMsg.timestamp,
          },
        });
        console.log("hi",pushResult)
      }

      return res.status(201).json({
        message: "Group message sent",
        chatId: chat._id,
        newMsg,
      });
    }

    const participants = [
      new mongoose.Types.ObjectId(senderId),
      new mongoose.Types.ObjectId(receiverId),
    ];

    let chat = await Chat.findOne({
      participants: { $all: participants },
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

    const room = [senderId, receiverId].map((id) => String(id)).sort().join("_");
    const senderUser = await User.findById(senderId).select("userName");
    const senderName = senderUser?.userName || "Someone";

    io.to(room).emit("receiveMessage", {
      _id: newMsg._id,
      senderId: {
        _id: senderId,
        userName: senderName,
      },
      receiverId,
      message,
      timestamp: newMsg.timestamp,
      isRead: false,
      readBy: [],
    });

    io.to(receiverId).emit("newNotification", {
      senderId,
      senderName,
      receiverId,
      message,
      type: "private",
      timestamp: newMsg.timestamp,
      isRead: false,
      readBy: [],
    });

    const receiver = await User.findById(receiverId).select("fcmToken");

    if (receiver?.fcmToken) {
      const pushRes = await sendPushNotification({
        token: receiver.fcmToken,
        title: `New message from ${senderName}`,
        body: notificationBody,
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

export const getGroupMessages = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { before, limit = 20 } = req.query;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const chat = await Chat.findById(group.chatId);

    if (!chat) {
      return res.json({
        messages: [],
        hasMore: false,
        nextCursor: null,
      });
    }

    const query: {
      chatId: typeof chat._id;
      timestamp?: {
        $lt: Date;
      };
    } = {
      chatId: chat._id,
    };

    const beforeDate = normalizeBeforeDate(before);

    if (beforeDate) {
      query.timestamp = {
        $lt: beforeDate,
      };
    }

    const messages = await Message.find(query)
      .populate("senderId", "userName")
      .populate("readBy", "userName")
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    const reversedMessages = messages.reverse();

    res.status(200).json({
      messages: reversedMessages,
      hasMore: messages.length === Number(limit),
      nextCursor:
        reversedMessages.length > 0 ? reversedMessages[0].timestamp : null,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "server error",
    });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
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

    res.status(200).json({
      message: "message deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "server error",
    });
  }
};
