import Blog from "../models/BlogModel";
import Like from "../models/LikeModel";
import Comment from "../models/CommentModel";
import Report from "../models/ReportModel";
import View from "../models/viewModel";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { uploadImage } from "../utils/uploadImage";

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
export const getDataUserBlogs = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    const blogs = await Blog.find({ author: userId }).populate("author", "userName");
    console.log(blogs , userId)
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
    const limit = 6;
    console.time("total");

    const query: any = {};

    if (before) {
      query.createdAt = {
        $lt: new Date(before),
      };
    }

    console.time("db");

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate("author", "userName  profileImage")
      .populate("Likes", "user")
      .populate("Comments", "user")
      .populate("views");

    console.timeEnd("db");

    const hasMore = blogs.length > limit;

    if (hasMore) {
      blogs.pop();
    }
    console.time("format");

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

    const formattedBlogs = blogs.map((blog) => {
      const preview = getTextFromLexical(blog.content).slice(0, 300);

      return {
        _id: blog._id,
        title: blog.title,
        image: blog.image,
        preview,
        author: {
          id: (blog.author as any)._id,
          userName: (blog.author as any).userName,
          profileImage: (blog.author as any).profileImage,
        },
        likes: {
          count: blog.Likes?.length || 0,
        },
        isLiked:
          blog.Likes?.some(
            (like: any) => like.user?.toString() === userId
          ) || false,

        comments: {
          count: blog.Comments?.length || 0,
        },

        isCommented:
          blog.Comments?.some(
            (comment: any) => comment.user?.toString() === userId
          ) || false,

        views: {
          count: blog.views?.length || 0,
        },

        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    });
    console.log("before:", before);
    console.log("returned:", formattedBlogs.length);
    console.log(
      "nextCursor:",
      hasMore
        ? formattedBlogs[formattedBlogs.length - 1].createdAt
        : null
    );

    res.status(200).json({
      blogs: formattedBlogs,
      hasMore,
      nextCursor: hasMore
        ? formattedBlogs[formattedBlogs.length - 1].createdAt
        : null,
    });
    console.timeEnd("json");

    console.timeEnd("total");
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    const before = req.query.before as string | undefined;
    const limit = 5;
    console.log("before:", before);
    console.log("limit:", limit);
    const query: any = {
      author: id,
    };

    if (before) {
      query.createdAt = {
        $lt: new Date(before),
      };
    }

    console.time("getAllBlogs");

    const blog = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate("author", "userName profileImage")
      .populate("Likes", "user")
      .populate("Comments", "user")
      .populate("views");

    console.timeEnd("getAllBlogs");

    const hasMore = blog.length > limit;

    if (hasMore) {
      blog.pop();
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

    const formattedBlogs = blog.map((blog) => {
      const preview = getTextFromLexical(blog.content).slice(0, 300);

      return {
        _id: blog._id,
        title: blog.title,
        image: blog.image,

        preview,
        author: {
          id: (blog.author as any)._id,
          userName: (blog.author as any).userName,
          profileImage: (blog.author as any).profileImage,
        },
        likes: {
          count: blog.Likes?.length || 0,
        },
        isLiked:
          blog.Likes?.some(
            (like: any) => like.user?.toString() === userId
          ) || false,

        comments: {
          count: blog.Comments?.length || 0,
        },

        isCommented:
          blog.Comments?.some(
            (comment: any) => comment.user?.toString() === userId
          ) || false,

        views: {
          count: blog.views?.length || 0,
        },

        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    });
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
      blog: formattedBlogs,
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
export const createBlog = async (
  req: Request & { file?: any; user?: { id: string } },
  res: Response,
) => {
  try {
    const { title, content } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    let imageUrl = "";

    if (req.file) {
      const result: any = await uploadImage(req.file);
      imageUrl = result.secure_url;
    }

    let parsedContent: any = content;
    if (typeof content === "string") {
      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
      }
    }

    const newBlog = new Blog({
      title,
      content: parsedContent,
      image: imageUrl,
      author: userId,
    });

    await newBlog.save();

    res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create blog",
    });
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

    const userId = (req as Request & {
      user?: { id: string };
    }).user?.id;

    const blog = await Blog.findById(blogId)
      .populate<{
        author: {
          _id: mongoose.Types.ObjectId;
          userName: string;
        };
      }>("author", "userName profileImage")
      .lean();

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    const [
      likesCount,
      commentsCount,
      viewsCount,
      liked,
      commented,
    ] = await Promise.all([
      Like.countDocuments({ blog: blog._id }),

      Comment.countDocuments({ blog: blog._id }),

      View.countDocuments({ blogId: blog._id }),

      userId
        ? Like.exists({
          blog: blog._id,
          user: userId,
        })
        : null,

      userId
        ? Comment.exists({
          blog: blog._id,
          user: userId,
        })
        : null,
    ]);

    const response = {
      _id: blog._id,

      title: blog.title,
      image: blog.image,

      content: blog.content,

      author: {
        id: blog.author._id,
        userName: blog.author.userName,
        profileImage: (blog.author as any).profileImage,
      },

      likes: {
        count: likesCount,
      },

      isLiked: !!liked,

      comments: {
        count: commentsCount,
      },

      isCommented: !!commented,

      views: {
        count: viewsCount,
      },

      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };

    return res.status(200).json({
      message: "Blog retrieved successfully",
      blog: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to retrieve blog",
    });
  }
};
export const findtrendingBlogs = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as Request & {
      user?: { id: string };
    }).user?.id;

    const blogs = await Blog.find()
      .populate("author", "userName profileImage")
      .populate("Likes", "user")
      .populate("Comments", "user")
      .populate("views")
      .lean();

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

    const trendingBlogs = blogs
      .map((blog: any) => ({
        _id: blog._id,
        title: blog.title,
        image: blog.image,
        preview: getTextFromLexical(blog.content).slice(0, 300),
        author: {
          id: blog.author?._id,
          userName: blog.author?.userName,
          profileImage: blog.author?.profileImage,
        },
        likes: {
          count: blog.Likes?.length || 0,
        },
        isLiked:
          blog.Likes?.some(
            (like: any) => like.user?.toString() === userId
          ) || false,
        comments: {
          count: blog.Comments?.length || 0,
        },
        isCommented:
          blog.Comments?.some(
            (comment: any) =>
              comment.user?.toString() === userId
          ) || false,
        views: {
          count: blog.views?.length || 0,
        },
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      }))
      .sort((a, b) => {
        if (b.views.count !== a.views.count)
          return b.views.count - a.views.count;

        if (b.likes.count !== a.likes.count)
          return b.likes.count - a.likes.count;

        if (b.comments.count !== a.comments.count)
          return b.comments.count - a.comments.count;

        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      })
      .slice(0, 10);

    res.status(200).json({
      blogs: trendingBlogs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve trending blogs",
    });
  }
};
