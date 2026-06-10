import Group from "../models/GroupModel.js";
import Chat from "../models/chatModel.js";
import Message from "../models/message.js";
export const createGroup = async(req, res) => {
    try {
        const userId = req.user.id;
        const { groupName, members } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!groupName.trim()) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const normalizedMembers = members.map((id) => id).filter((id) => id);

        const participants = [...new Set([userId, ...normalizedMembers])].sort();

        let chat = await Chat.findOne({ participants });

        if (!chat) {
            chat = await Chat.create({
                participants,
                isGroupChat: true,
            });
        }

        const group = await Group.create({
            name: groupName.trim(),
            admin: userId,
            chatId: chat._id,
        });

        res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create group" });
    }
};

export const getGroups = async(req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId).populate({
            path: "chatId",
            select: "participants",
            populate: {
                path: "participants",
                select: "userName role",
            },
        });

        if (!group) {
            return res.status(404).json({
                message: "Group not found",
            });
        }

        res.status(200).json(group);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to get group",
        });
    }
};

export const deleteById = async(req, res) => {
    try {
        const currentUserId = req.user.id;
        const { userId } = req.params;
        const { Groups } = req.body;
        console.log(Groups);
        const group = await Group.findById(Groups);

        if (!group) {
            return res.status(404).json({
                message: "Group not found",
            });
        }

        // if (group.admin.toString() !== currentUserId.toString()) {
        //     return res.status(403).json({
        //         message: "Only admin can remove members",
        //     });
        // }

        await Chat.findByIdAndUpdate(group.chatId, {
            $pull: {
                participants: userId,
            },
        });

        return res.status(200).json({
            message: "Member removed successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const groupDelete = async(req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findByIdAndDelete(groupId);

        const chat = await Chat.findByIdAndDelete(group.chatId);

        const message = await Message.deleteMany({
            chatId: chat._id
        })
        return res.status(200).json({
            message: "Member removed successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};