import Blog from "../models/BlogModel.ts";
import Like from "../models/LikeModel.ts";
import Comment from "../models/CommentModel.ts";
import Report from "../models/ReportModel.ts";
import mongoose from "mongoose";
import { Request, Response } from "express";
export const getAllBlogsData = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().populate("author", "userName");
    const totalBlogs = blogs.length;
    const totalLikes = blogs.reduce(
      (sum, blog) => sum + (blog.Likes?.length || 0),
      0,
    );
    const totalComments = blogs.reduce(
      (sum, blog) => sum + (blog.Comments?.length || 0),
      0,
    );
    const totalViews = blogs.reduce(
      (sum, blog) => sum + (blog.views?.length || 0),
      0,
    );
    const stats = {
      totalBlogs,
      totalComments,
      totalLikes,
      totalViews,
    };
    res.status(200).json({
      stats,
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve blogs",
    });
  }
}

export const getAllBlogs = async (req: Request, res: Response) => {
  try {

    const userId = (req as Request & { user?: { id: string } }).user?.id;

    const before = req.query.before as string | undefined;
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
        $sort: { createdAt: -1 },
      },
      {
        $limit: limit + 1,
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
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
          localField: "_id",
          foreignField: "blog",
          as: "likesDetails",
        },
      },

      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "commentsDetails",
        },
      },
      {
        $lookup: {
          from: "views",
          localField: "_id",
          foreignField: "blogId",
          as: "viewsDetails",
        },
      },

      {
        $project: {
          title: 1,
          content: 1,

          author: {
            id: "$authorDetails._id",
            userName: "$authorDetails.userName",
          },

          likes: {
            count: { $size: "$likesDetails" },
          },

          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(userId),
              {
                $map: {
                  input: "$likesDetails",
                  as: "like",
                  in: "$$like.user",
                },
              },
            ],
          },

          comments: {
            count: { $size: "$commentsDetails" },
          },

          isCommented: {
            $in: [
              new mongoose.Types.ObjectId(userId),
              {
                $map: {
                  input: "$commentsDetails",
                  as: "comment",
                  in: "$$comment.user",
                },
              },
            ],
          },
          views: {
            count: { $size: "$viewsDetails" },
          },

          createdAt: 1,
          updatedAt: 1,
        },
      }
    );

    const blogs = await Blog.aggregate(pipeline);

    const hasMore = blogs.length > limit;

    if (hasMore) {
      blogs.pop();
    }

    const nextCursor = hasMore
      ? blogs[blogs.length - 1]?.createdAt
      : null;

    const Blogs = await Blog.find();
    const totalBlogs = Blogs.length;
    const totalLikes = Blogs.reduce(
      (sum, blog) => sum + (blog.Likes?.length || 0),
      0,
    );
    const totalComments = Blogs.reduce(
      (sum, blog) => sum + (blog.Comments?.length || 0),
      0,
    );
    const totalViews = Blogs.reduce(
      (sum, blog) => sum + (blog.views?.length || 0),
      0,
    );
    const stats = {
      totalBlogs,
      totalComments,
      totalLikes,
      totalViews,
    };
    res.status(200).json({
      blogs,
      stats,
      hasMore,
      nextCursor: hasMore ? blogs[blogs.length - 1].createdAt : null,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve blogs",
    });
  }
};
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    const before = req.query.before as string | undefined; const limit = 5;

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
        $match: { author: new mongoose.Types.ObjectId(id) },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: limit + 1,
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
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
          localField: "_id",
          foreignField: "blog",
          as: "likesDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "commentsDetails",
        },
      },
      {
        $lookup: {
          from: "views",
          localField: "_id",
          foreignField: "blogId",
          as: "viewsDetails",
        },
      },
      {
        $project: {
          title: 1,
          content: 1,

          author: {
            id: "$authorDetails._id",
            userName: "$authorDetails.userName",
          },

          likes: {
            count: { $size: "$likesDetails" },
          },

          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(userId),
              {
                $map: {
                  input: "$likesDetails",
                  as: "like",
                  in: "$$like.user",
                },
              },
            ],
          },

          comments: {
            count: { $size: "$commentsDetails" },
          },

          isCommented: {
            $in: [
              new mongoose.Types.ObjectId(userId),
              {
                $map: {
                  input: "$commentsDetails",
                  as: "comment",
                  in: "$$comment.user",
                },
              },
            ],
          },
          views: {
            count: { $size: "$viewsDetails" },
          },

          createdAt: 1,
          updatedAt: 1,
        },
      }
    );
    const blog = await Blog.aggregate(pipeline);
    const blogs = await Blog.find({ author: id });

    const totalBlogs = blogs.length;
    const totalLikes = blogs.reduce(
      (sum, blog) => sum + (blog.Likes?.length || 0),
      0,
    );
    const totalComments = blogs.reduce(
      (sum, blog) => sum + (blog.Comments?.length || 0),
      0,
    );
    const totalViews = blogs.reduce(
      (sum, blog) => sum + (blog.views?.length || 0),
      0,
    );
    if (blog.length === 0) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }
    const hasMore = blog.length > limit;

    if (hasMore) {
      blog.pop();
    }
    const stats = {
      totalBlogs,
      totalComments,
      totalLikes,
      totalViews,
    };

    res.status(200).json({
      blog,
      ...(before ? {} : { stats }),
      hasMore,
      nextCursor: hasMore ? blog[blog.length - 1].createdAt : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve blog",
    });
  }
};
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newBlog = new Blog({ title, content, author: userId });
    await newBlog.save();
    res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create blog" });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (deletedBlog) {
      await Promise.all([
        Like.deleteMany({ blog: id }),
        Comment.deleteMany({ blog: id }),
        Report.deleteMany({ blogId: id }),

      ]);
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete blog" });
  }
};

export const findByBlogId = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params as { blogId: string };
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    const pipelines = [
      {
        $match: { _id: new mongoose.Types.ObjectId(blogId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
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
          localField: "_id",
          foreignField: "blog",
          as: "likesDetails",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "commentsDetails",
        },
      },
      {
        $lookup: {
          from: "views",
          localField: "_id",
          foreignField: "blogId",
          as: "viewsDetails",
        },
      },
      {
        $project: {
          title: 1,
          content: 1,

          author: {
            id: "$authorDetails._id",
            userName: "$authorDetails.userName",
          },

          likes: {
            count: { $size: "$likesDetails" },
          },

          isLiked: {
            $in: [
              new mongoose.Types.ObjectId(userId),
              {
                $map: {
                  input: "$likesDetails",
                  as: "like",
                  in: "$$like.user",
                },
              },
            ],
          },

          comments: {
            count: { $size: "$commentsDetails" },
          },

          isCommented: {
            $in: [
              new mongoose.Types.ObjectId(userId),
              {
                $map: {
                  input: "$commentsDetails",
                  as: "comment",
                  in: "$$comment.user",
                },
              },
            ],
          },
          views: {
            count: { $size: "$viewsDetails" },
          },

          createdAt: 1,
          updatedAt: 1,
        },
      }
    ];
    const blog = await Blog.aggregate(pipelines);
    if (blog.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({
      message: "Blog retrieved successfully",
      blog: blog[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve blog" });
  }
};
