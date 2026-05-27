import User from "../models/UsersModel.js";

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
