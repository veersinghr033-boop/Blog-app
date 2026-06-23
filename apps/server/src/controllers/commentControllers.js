import Comment from "../models/CommentModel.js";
import Blog from "../models/BlogModel.js";
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
    await Blog.findByIdAndUpdate(blogId, {
      $push: { Comments: newComment._id },
    });
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
    const { before } = req.query;

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
        $lookup: {
          from: "replies",
          localField: "_id",
          foreignField: "commentId",
          as: "replies",
        },
      },
      {
        $project: {
          comment: 1,
          user: {
            _id: "$userDetails._id",
            name: "$userDetails.userName",
            email: "$userDetails.email",
          },
          replies: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];
    const comments = await Comment.aggregate(pipeline);
    // console.log(comments);
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
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }
    await Comment.findByIdAndDelete(commentId);
    await Blog.findByIdAndUpdate(comment.blog, {
      $pull: { Comments: comment._id },
    });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: error.message });
  }
};
