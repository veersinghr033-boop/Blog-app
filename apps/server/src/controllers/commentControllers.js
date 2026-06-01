import Comment from "../models/CommentModel.js";
import mongoose from "mongoose";

export const createComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;
    const newComment = new Comment({
      comment,
      user: userId,
      blog: blogId,
    });
    await newComment.save();
    res
      .status(201)
      .json({ message: "Comment created successfully", comment: newComment });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to create comment", error: error.message });
  }
};

export const getCommentsByBlogId = async (req, res) => {
  try {
    const { blogId } = req.params;
    const pipeline = [
      { $match: { blog: new mongoose.Types.ObjectId(blogId) } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          comment: 1,
          user: {
            _id: "$userDetails._id",
            name: "$userDetails.userName",
            email: "$userDetails.email",
          },
          createdAt: 1,
        },
      },
    ];
    const comments = await Comment.aggregate(pipeline);
    res.status(200).json({ comments });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: error.message });
  }
};
