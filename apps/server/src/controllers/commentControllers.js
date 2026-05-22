import Comment from "../models/CommentModel.js";
import mongoose from "mongoose";

export const createComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { comment, userId } = req.body;
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
