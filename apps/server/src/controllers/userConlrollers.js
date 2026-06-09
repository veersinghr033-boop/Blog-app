import User from "../models/UsersModel.js";
import Chat from "../models/chatModel.js";
import Group from "../models/GroupModel.js";

export const getAllUsers = async(req, res) => {
    const userId = req.user.id;
    try {
        const users = await User.find({ _id: { $ne: userId } });
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const getUserById = async(req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch user" });
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
    });

    const chats = await Chat.find({
        participants: currentUserId,
    });

    const groups = await Group.find({
        chatId: { $in: chats.map((c) => c._id) },
    });

    let result = [];

    result.push(
        ...groups.map((group) => {
            const groupChat = chats.find(
                (chat) => chat._id.toString() === group.chatId.toString(),
            );

            return {
                id: group._id,
                chatId: group.chatId,
                name: group.name,
                type: "group",
                // member: group,
                updatedAt: groupChat.updatedAt || group.updatedAt,
            };
        }),
    );

    for (const chat of chats) {
        if (chat.isGroupChat) continue;

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