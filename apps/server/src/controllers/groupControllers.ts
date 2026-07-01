import Group from "../models/GroupModel.ts";
import Chat from "../models/chatModel.ts";
import Message from "../models/message.ts";
import { Request, Response } from "express";
export const createGroup = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { user?: { id: string } }).user?.id;
        const { groupName, members } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!groupName.trim()) {
            return res.status(400).json({ message: "Group name is required" });
        }

        const normalizedMembers = members.map((id: string) => id).filter((id: string) => id);

        const participants = [...new Set([userId, ...normalizedMembers])].sort();


        const chat = await Chat.create({
            participants,
            isGroupChat: true,
        });


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

export const getGroups = async (req: Request, res: Response) => {
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
        console.error(error);
        res.status(500).json({
            message: "Failed to get group",
        });
    }
};

export const deleteById = async (req: Request, res: Response) => {
    try {
        // const currentUserId = req.user?.id;
        const currentUserId = (req as Request & { user?: { id: string } }).user?.id;

        const userId = req.params.userId
        const { Groups } = req.body;
        // suppressing verbose group listing in production
        const group = await Group.findById(Groups);

        if (!group) {
            return res.status(404).json({
                message: "Group not found",
            });
        }

        if (group.admin.toString() !== currentUserId?.toString()) {
            return res.status(403).json({
                message: "Only admin can remove members",
            });
        }

        await Chat.findByIdAndUpdate(group.chatId, {
            $pull: {
                participants: userId,
            },
        });

        return res.status(200).json({
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const groupDelete = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params as { groupId: string };

        const group = await Group.findByIdAndDelete(groupId);

        const chat = await Chat.findByIdAndDelete(group?.chatId);

        const message = await Message.deleteMany({
            chatId: chat?._id,
        });
        return res.status(200).json({
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};
export const updateGroupMembers = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params as { groupId: string };
        const { members } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                message: "Group not found",
            });
        }
        const chat = await Chat.findByIdAndUpdate(
            group.chatId, {
            $push: {
                participants: members,
            },
        }, { new: true },
        ).populate({
            path: "participants",
            select: "userName role",
        });

        return res.status(200).json({
            message: "Group members updated successfully",
            chat,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};
export const changeAdmin = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params as { groupId: string };
        const { adminId } = req.body;

        // debug values suppressed
        const group = await Group.findByIdAndUpdate(
            groupId, { admin: adminId }, { new: true },
        ).populate({
            path: "admin",
            select: "userName role",
        });

        return res.status(200).json({
            message: "Group admin updated successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};