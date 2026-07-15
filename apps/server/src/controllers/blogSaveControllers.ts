import BlogSave from "../models/BlogSaveModel";
import Like from "../models/LikeModel";
import Comment from "../models/CommentModel";
import View from "../models/viewModel";
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

    const savedBlogs = await BlogSave.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate({
        path: "blog",
        populate: {
          path: "author",
          select: "userName profileImage",
        },
      });
    if (savedBlogs.length === 0) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }
    const hasMore = savedBlogs.length > limit;

    if (hasMore) {
      savedBlogs.pop();
    }
    const getTextFromLexical = (content: any): string => {
      if (!content?.root?.children) return "";

      const extract = (nodes: any[]): string => {
        return nodes
          .map((node) => {
            if (node.text) return node.text;
            if (node.children) return extract(node.children);
            return "";
          })
          .join(" ");
      };

      return extract(content.root.children);
    };

    const blogs = (
      await Promise.all(
        savedBlogs.map(async (saved) => {
          const blog = saved.blog as any;

          if (!blog || !blog._id) {
            return null;
          }

          const [likes, comments, views] = await Promise.all([
            Like.find({ blog: blog._id }).select("user"),
            Comment.find({ blog: blog._id }).select("user"),
            View.find({ blogId: blog._id }).select("userId"),
          ]);

          const author = blog.author ? {
            _id: blog.author._id,
            userName: blog.author.userName,
            profileImage: blog.author.profileImage,
          } : null;
          const preview = getTextFromLexical(blog.content).slice(0, 300);

          return {
            
            _id: saved._id,
            user: saved.user,
            createdAt: saved.createdAt,

            blogDetails: {
              _id: blog._id,
              title: blog.title,
              preview,

              author,

              likes: {
                count: likes.length,
              },

              isLiked: likes.some((l: any) => l.user.toString() === userId),

              comments: {
                count: comments.length,
              },

              isCommented: comments.some((c: any) => c.user.toString() === userId),

              views: {
                count: views.length,
                users: views.map((v: any) => v.userId),
              },

              createdAt: blog.createdAt,
            },
          };
        })
      )
    ).filter(Boolean);

    const validBlogs = blogs as Array<NonNullable<(typeof blogs)[number]>>;

    res.status(200).json({
      blogs: validBlogs,
      hasMore,
      nextCursor: hasMore && validBlogs.length > 0 ? validBlogs[validBlogs.length - 1].createdAt : null,
      message: "Saved blogs retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
