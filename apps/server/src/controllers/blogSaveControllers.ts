import BlogSave from "../models/BlogSaveModel.ts";
import mongoose from "mongoose";
import { Request, Response } from "express";

export const SaveBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { blogId } = req.body;
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    const existingSave = await BlogSave.findOne({
      user: userId,
      blog: blogId,
    });

    if (existingSave) {
      await BlogSave.findByIdAndDelete(existingSave._id);

      return void res.status(200).json({
        message: "Blog unsaved successfully",
      });
    }

    const newSave = new BlogSave({
      user: userId,
      blog: blogId,
    });

    await newSave.save();

    return void res.status(201).json({
      newSave,
      message: "Blog saved successfully",
    });
  } catch (error) {
    console.error(error);

    return void res.status(500).json({
      message: "Server error",
    });
  }
};

export const getSavedBlogs = async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  try {
    const before = req.query.before as string || undefined;
    const limit = 10;

    const pipeline: mongoose.PipelineStage[] = [];
    if (before) {
      pipeline.push({
        $match: {
          createdAt: {
            $lt: new Date(before),
          },
        },
      });
    }
    pipeline.push(
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: limit + 1,
      },
      {
        $lookup: {
          from: "blogs",
          localField: "blog",
          foreignField: "_id",
          as: "blogDetails",
        },
      },

      {
        $unwind: "$blogDetails",
      },

      {
        $lookup: {
          from: "users",
          localField: "blogDetails.author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },

      {
        $unwind: "$authorDetails",
      },
      {
        $lookup: {
          from: "likes",
          localField: "blogDetails._id",
          foreignField: "blog",
          as: "likeDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "blogDetails._id",
          foreignField: "blog",
          as: "commentDetails",
        },
      },
      {
        $lookup: {
          from: "views",
          localField: "blogDetails._id",
          foreignField: "blogId",
          as: "viewsDetails",
        },
      },

      {
        $project: {
          _id: 1,
          user: 1,

          blogDetails: {
            _id: "$blogDetails._id",
            title: "$blogDetails.title",
            content: "$blogDetails.content",

            author: {
              _id: "$authorDetails._id",
              userName: "$authorDetails.userName",
            },


            likes: {
              count: { $size: "$likeDetails" },
            },

            isLiked: {
              $in: [
                new mongoose.Types.ObjectId(userId),
                {
                  $map: {
                    input: "$likeDetails",
                    as: "like",
                    in: "$$like.user",
                  },
                },
              ],
            },

            views: {
              count: { $size: "$viewsDetails" },
              users: "$viewsDetails.userId",
            },

            comments: {
              count: { $size: "$commentDetails" },
            },

            isCommented: {
              $in: [
                new mongoose.Types.ObjectId(userId),
                {
                  $map: {
                    input: "$commentDetails",
                    as: "comment",
                    in: "$$comment.user",
                  },
                },
              ],
            },

            createdAt: "$blogDetails.createdAt",
          },
          createdAt: 1,
        },
      },
    );
    const savedBlogs = await BlogSave.aggregate(pipeline);
    // console.log(savedBlogs);
    if (savedBlogs.length === 0) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }
    const hasMore = savedBlogs.length > limit;

    if (hasMore) {
      savedBlogs.pop();
    }
    res.status(200).json({
      blogs: savedBlogs,
      hasMore,
      nextCursor: hasMore ? savedBlogs[savedBlogs.length - 1].createdAt : null,
      message: "Saved blogs retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
