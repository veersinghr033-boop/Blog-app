import Reply from "../models/replyModel";
import Comment from "../models/CommentModel";
import { Request, Response } from "express";

export const createReply = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = (req as Request & { user?: { id: string } }).user?.id;

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
    res.status(200).json({
      message: "Reply created successfully",
      reply,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create reply" });
  }
};

export const getRepliesByCommentId = async (req: Request, res: Response) => {
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
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve replies" });
  }
};
