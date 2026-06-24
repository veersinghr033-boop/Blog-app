import bcrypt from "bcrypt";
import User from "../models/UsersModel.js";
import Chat from "../models/chatModel.js";
import Group from "../models/GroupModel.js";
import Message from "../models/message.js";

export const getAllUsers = async(req, res) => {
    const userId = req.user.id;
    try {
        const users = await User.find({
            _id: { $ne: userId },
            role: { $ne: "admin" },
        }).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const getUserById = async(req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

export const updateUserProfile = async(req, res) => {
    const userId = req.user.id;
    const { userName, email, bio } = req.body;

    try {
        if (!userName && !email && bio === undefined) {
          return res
            .status(400)
            .json({ message: "No profile fields provided" });
        }

        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        const updateData = {};
        if (userName !== undefined) updateData.userName = userName;
        if (email !== undefined) updateData.email = email;
        if (bio !== undefined) updateData.bio = bio;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to update profile" });
    }
};

export const changeUserPassword = async(req, res) => {
    const userId = req.user.id;
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
        console.log(error);
        return res.status(500).json({ message: "Failed to update password" });
    }
};

export const deleteUser = async(req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

export const emitSortedUsers = async(io, currentUserId) => {
    const users = await User.find({
        _id: { $ne: currentUserId },
        role: { $ne: "admin" },
    });

    const chats = await Chat.find({
        participants: currentUserId,
    });

    const groups = await Group.find({
        chatId: { $in: chats.map((c) => c._id) },
    });

    let result = [];

    const groupEntries = await Promise.all(
        groups.map(async(group) => {
            const groupChat = chats.find(
                (chat) => chat._id.toString() === group.chatId.toString(),
            );

            const messages = await Message.find({
                chatId: group.chatId,
                readBy: { $ne: currentUserId },
                senderId: { $ne: currentUserId },
            });
            const unreadCount = Array.isArray(messages) ? messages.length : 0;

            return {
                id: group._id,
                chatId: group.chatId,
                name: group.name,
                type: "group",
                updatedAt: groupChat && groupChat.updatedAt ?
                    groupChat.updatedAt : group.updatedAt,
                unreadCount,
            };
        }),
    );

    result.push(...groupEntries);

    for (const chat of chats) {
        if (chat.isGroupChat) continue;

        const messages = await Message.find({
            chatId: chat._id,
            readBy: { $ne: currentUserId },
            senderId: { $ne: currentUserId },
        });
        const unreadCount = Array.isArray(messages) ? messages.length : 0;

        const otherUserId = chat.participants.find(
            (id) => id && id.toString() !== currentUserId.toString(),
        );

        if (!otherUserId) continue;

        const user = users.find((u) => u._id.toString() === otherUserId.toString());

        if (!user) continue;

        result.push({
            id: user._id,
            name: user.userName,
            role: user.role,
            type: "user",
            updatedAt: chat.updatedAt,

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

    return result;
};
export const getUsersSorted = async(req, res) => {
    try {
        const currentUserId = req.user.id;
        const io = req.app.get("io");

        const result = await emitSortedUsers(io, currentUserId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


export const saveFcmToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    await User.findByIdAndUpdate(userId, {
      fcmToken: token,
    });
    return res.json({
      success: true,
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
};
 