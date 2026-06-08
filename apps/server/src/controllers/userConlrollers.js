import User from "../models/UsersModel.js";
import Chat from "../models/chatModel.js";

export const getAllUsers = async (req, res) => {
  const userId = req.user.id;
  try {
    const users = await User.find({ _id: { $ne: userId } });
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUserById = async (req, res) => {
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

export const deleteUser = async (req, res) => {
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

export const emitSortedUsers = async (io, currentUserId) => {
  const users = await User.find({
    _id: { $ne: currentUserId },
  });

  const chats = await Chat.find({
    participants: currentUserId,
  });

  const result = users.map((user) => {
    const chat = chats.find((c) =>
      c.participants.some((id) => id.toString() === user._id.toString()),
    );

    return {
      id: user._id,
      name: user.userName,
      role: user.role,
      updatedAt: chat?.updatedAt || null,
    };
  });

  result.sort((a, b) => {
    if (a.updatedAt && b.updatedAt) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }

    if (a.updatedAt) return -1;
    if (b.updatedAt) return 1;

    return a.name.localeCompare(b.name);
  });

  // console.log("Emitting sortedUsers");
  // console.log(result);

  io.to(currentUserId.toString()).emit("sortedUsers", result);

  return result;
};
export const getUsersSorted = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const io = req.app.get("io");

    const result = await emitSortedUsers(io, currentUserId);
    // console.log("Sorted users sent to client:", result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
