import Comment from "../models/CommentModel.ts";
import Blog from "../models/BlogModel.ts";
import mongoose from "mongoose";
import { Request, Response } from "express";

export const createComment = async (
  req: Request,
  res: Response,
) => {
  try {
    const { blogId } = req.params;
    const { comment } = req.body;
    const userId = (req as Request & { user?: { id: string } }).user?.id;
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
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ message: "Failed to create comment", error: errorMessage });
  }
};

export const getCommentsByBlogId = async (
  req: Request,
  res: Response,
) => {
  try {
    const { blogId } = req.params as { blogId: string };
    const before = req.query.before as string | undefined;
    const limit = Number(req.query.limit) || 6;
    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          blog: new mongoose.Types.ObjectId(blogId),
        },
      },
    ];

    if (before) {
      pipeline.push({
        $match: {
          createdAt: { $lt: new Date(before) },
        },
      });
    }

    pipeline.push(
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
    );

    const pageSize = Number(limit);
    const comments = await Comment.aggregate(pipeline).limit(pageSize + 1);
    const hasMore = comments.length > pageSize;
    const pagedComments = hasMore ? comments.slice(0, pageSize) : comments;
    const nextCursor = pagedComments.length
      ? pagedComments[pagedComments.length - 1].createdAt
      : null;

    res.status(200).json({
      comments: pagedComments,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: errorMessage });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
) => {
  try {
    const { commentId } = req.params as { commentId: string };
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.user?.toString() !== userId) {
      res.status(403).json({
        message: "Unauthorized to delete this comment",
      });
      return;
    }

    await Comment.findByIdAndDelete(commentId);
    await Blog.findByIdAndUpdate(comment.blog, {
      $pull: { Comments: comment._id },
    });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ message: "Failed to delete comment", error: errorMessage });
  }
};
