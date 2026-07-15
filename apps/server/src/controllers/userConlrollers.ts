import bcrypt from "bcrypt";
import User from "../models/UsersModel.ts";
import Chat from "../models/chatModel.ts";
import Group from "../models/GroupModel.ts";
import Message from "../models/message.ts";
import { Request, Response } from "express";
import { uploadImage } from "../utils/uploadImage.ts";
export const getAllUsersData = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { user?: { id: string } }).user?.id;

        const users = await User.find({ _id: { $ne: userId } }).select("-password");

        res.status(200).json({
            users,
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve users",
        });
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const before = req.query.before as string | undefined;
    const limit = 6;

    try {
        const query: any = {
            _id: { $ne: userId },
        };

        if (before) {
            query.createdAt = {
                $lt: new Date(before),
            };
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .select("-password")
            .lean();

        const hasMore = users.length > limit;

        const result = hasMore ? users.slice(0, limit) : users;

        res.status(200).json({
            users: result,
            hasMore,
            nextCursor: hasMore
                ? result[result.length - 1].createdAt
                : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

export const updateUserProfile = async (
    req: Request & { file?: any; user?: { id: string } },
    res: Response,
) => {
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    const { userName, email, bio } = req.body;

    try {
        if (!userName && !email && bio === undefined && !req.file) {
            return res
                .status(400)
                .json({ message: "No profile fields provided" });
        }

        if (email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: userId },
            });

            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: "Email already in use" });
            }
        }

        const updateData: any = {};

        if (userName !== undefined) {
            updateData.userName = userName;
        }

        if (email !== undefined) {
            updateData.email = email;
        }

        if (bio !== undefined) {
            updateData.bio = bio;
        }

        if (req.body.removeImage === "true") {
            updateData.profileImage = "";
        }

        if (req.file) {
            const result: any = await uploadImage(req.file);

            updateData.profileImage = result.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true,
            },
        ).select("-password");

        if (!updatedUser) {
            return res
                .status(404)
                .json({ message: "User not found" });
        }
        console.log(updatedUser)
        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to update profile",
        });
    }
};

export const changeUserPassword = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const { currentPassword, newPassword } = req.body;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update password" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

export async function emitSortedUsers(io: any, currentUserId?: string) {
    if (!currentUserId) {
        return [];
    }

    const users = await User.find({
        _id: { $ne: currentUserId },
    }).select("-password").lean();

    const chats = await Chat.find({
        participants: currentUserId,
    }).lean();

    const groups = await Group.find({
        chatId: { $in: chats.map((c) => c._id) },
    }).lean();

    let result = [];

    const groupEntries = await Promise.all(
        groups.map(async (group) => {
            const groupChat = chats.find(
                (chat) => chat._id.toString() === group.chatId?.toString(),
            );

            const unreadCount = await Message.countDocuments({
                chatId: group.chatId,
                readBy: { $ne: currentUserId },
                senderId: { $ne: currentUserId },
            });

            return {
                id: group._id,
                chatId: group.chatId,
                name: group.name,
                img: group.groupImage,
                type: "group",
                updatedAt: groupChat && groupChat.updatedAt ?
                    groupChat.updatedAt : group.updatedAt,
                unreadCount,
            };
        }),
    );

    result.push(...groupEntries);

    const seenUserIds = new Set<string>();
    for (const chat of chats) {
        if (chat.isGroupChat) continue;

        const unreadCount = await Message.countDocuments({
            chatId: chat._id,
            readBy: { $ne: currentUserId },
            senderId: { $ne: currentUserId },
        });

        const otherUserId = chat.participants.find(
            (id) => id && id.toString() !== currentUserId.toString(),
        );

        if (!otherUserId) continue;

        const otherUserIdStr = otherUserId.toString();
        if (seenUserIds.has(otherUserIdStr)) continue;
        seenUserIds.add(otherUserIdStr);
        if (!otherUserId) continue;

        const user = users.find((u) => u._id.toString() === otherUserId.toString());

        if (!user) continue;

        result.push({
            id: user._id,
            name: user.userName,
            role: user.role,
            type: "user",
            updatedAt: chat.updatedAt,
            img: user.profileImage,
            unreadCount,

        });
    }

    const existingUserIds = result
        .filter((item) => item.type === "user")
        .map((item) => item.id.toString());

    const remainingUsers = users
        .filter((user) => !existingUserIds.includes(user._id.toString()))
        .map((user) => ({
            id: user._id,
            name: user.userName,
            role: user.role,
            type: "user",
            updatedAt: null,
            img: user.profileImage,
        }));

    result.push(...remainingUsers);

    result.sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;

        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

        if (aTime !== bTime) {
            return bTime - aTime;
        }

        return a.name.localeCompare(b.name);
    });
    io.to(currentUserId.toString()).emit("sortedUsers", result);
    // console.log(result)
    return result;
};
export const getUsersSorted = async (req: Request, res: Response) => {
    try {
        const currentUserId = (req as Request & { user?: { id: string } }).user?.id;

        const io = req.app.get("io");

        const result = await emitSortedUsers(io, currentUserId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


export const saveFcmToken = async (req: Request, res: Response) => {
    try {
        const userId = (req as Request & { user?: { id: string } }).user?.id;
        const { token } = req.body;
        const user = await User.findByIdAndUpdate(userId, {
            fcmToken: token,
        });
        return res.json({
            success: true,
        });
    } catch (error) {
        return res.json({
            success: false,
            error: "Failed to save FcmToken",
        });
    }
};
