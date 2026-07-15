import Group from "../models/GroupModel.ts";
import Chat from "../models/chatModel.ts";
import Message from "../models/message.ts";
import { Request, Response } from "express";
import { uploadImage } from "../utils/uploadImage.ts";
export const createGroup = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & {
            user?: { id: string };
        }).user?.id;

        const { groupName } = req.body;

        let members = req.body.members;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!groupName?.trim()) {
            return res.status(400).json({
                message: "Group name is required",
            });
        }

        if (!Array.isArray(members)) {
            members = members ? [members] : [];
        }

        const normalizedMembers = members.filter(Boolean);

        const participants = [
            ...new Set([userId, ...normalizedMembers]),
        ];

        let groupImage = "";

        if (req.file) {
            const result: any = await uploadImage(req.file);
            groupImage = result.secure_url;
        }

        const chat = await Chat.create({
            participants,
            isGroupChat: true,
        });

        const group = await Group.create({
            name: groupName.trim(),
            groupImage,
            admin: [userId],
            chatId: chat._id,
        });

        return res.status(201).json({
            message: "Group created successfully",
            group,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to create group",
        });
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
                select: "userName role profileImage",
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
        const currentUserId = (req as Request & { user?: { id: string } }).user?.id;

        const userId = req.params.userId
        const { Groups } = req.body;
        const group = await Group.findById(Groups);
console.log(currentUserId, userId,Groups , group)
        if (!group) {
            return res.status(404).json({
                message: "Group not found",
            });
        }
        const isAdmin = group.admin.some(
            (adminId) => adminId.toString() === userId
        );

        if (isAdmin && group.admin.length === 1) {
            return res.status(400).json({
                message: "Assign another admin before leaving the group.",
            });
        }

        if (isAdmin) {
            await Group.findByIdAndUpdate(Groups, {
                $pull: {
                    admin: userId,
                },
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
            message: "group deleted successfully",
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

        const group = await Group.findByIdAndUpdate(
            groupId,
            { $push: { admin: adminId } },
            {
                returnDocument: "after",
            }
        ).populate({
            path: "admin",
            select: "userName role",
        });
        console.log(group)

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

export const removeAdmin = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params as { groupId: string };
        const { adminId } = req.body;

        const group = await Group.findByIdAndUpdate(
            groupId,
            { $pull: { admin: adminId } },
            {
                returnDocument: "after",
            }
        ).populate({
            path: "admin",
            select: "userName role profileImage",
        });

        return res.status(200).json({
            message: "Group admin removed successfully",
        });
     } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};