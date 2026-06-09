import Reply from "../models/replyModel.js";
import Comment from "../models/CommentModel.js";
import mongoose from "mongoose";

export const createReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = new Reply({
      userId,
      commentId,
      text,
    });
    await reply.save();

    await Comment.findByIdAndUpdate(commentId, {
      $push: { replies: reply._id },
    });
    res.status(201).json({
      message: "Reply created successfully",
      reply,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create reply" });
  }
};

export const getRepliesByCommentId = async (req, res) => {
  try {
    const { commentId } = req.params;
    const replies = await Reply.find({ commentId }).populate(
      "userId",
      "userName email",
    );
    res.status(200).json({
      message: "Replies retrieved successfully",
      replies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to retrieve replies" });
  }
};
