import Like from "../models/LikeModel.js";

export const likeBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { userId } = req.body;
    const existingLike = await Like.findOne({ user: userId, blog: blogId });
    console.log(existingLike);
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res.status(200).json({ message: "Blog unliked" });
    }
    const like = new Like({ user: userId, blog: blogId });
    await like.save();
    res.status(200).json({ message: "Blog liked" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
