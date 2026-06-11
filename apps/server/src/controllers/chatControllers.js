import Chat from "../models/chatModel.js";
import Message from "../models/message.js";
import Group from "../models/GroupModel.js";
import { emitSortedUsers } from "./userConlrollers.js";

export const getMessages = async(req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.params;

        const participants = [senderId, receiverId].sort();

        const chat = await Chat.findOne({
            participants,
        });
        console.log(chat);

        if (!chat) {
            return res.json([]);
        }

        const messages = await Message.find({
                chatId: chat._id,
            })
            .populate("senderId", "userName")
            .sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Error fetching messages",
        });
    }
};
export const createChat = async(req, res) => {
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
            });

            await Chat.findByIdAndUpdate(chat._id, {
                lastMessage: newMsg._id,
                updatedAt: new Date(),
            });

            io.to(groupId).emit("receiveGroupMessage", {
                _id: newMsg._id,
                senderId: {
                    _id: senderId,
                },
                chatId: chat._id,
                groupId,
                message,
                timestamp: newMsg.timestamp,
            });
            io.to(groupId).emit("newNotification", {
                groupId,
                message,
                type: "group",
                timestamp: newMsg.timestamp,
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
        });

        await Chat.findByIdAndUpdate(chat._id, {
            lastMessage: newMsg._id,
            updatedAt: new Date(),
        });

        const room = participants.join("_");

        io.to(room).emit("receiveMessage", {
            _id: newMsg._id,
            senderId: {
                _id: senderId,
            },
            receiverId,
            message,
            timestamp: newMsg.timestamp,
        });
        io.to(receiverId).emit("newNotification", {
            senderId,
            receiverId,
            message,
            type: "private",
            timestamp: newMsg.timestamp,
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
export const getGroupMessages = async(req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        const chat = await Chat.findById({
            _id: group.chatId,
        });
        if (!chat) {
            return res.json([]);
        }
        const messages = await Message.find({
                chatId: chat._id,
            })
            .populate("senderId", "userName")
            .sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error" });
    }
};