import Blog from "../models/BlogModel.js";
import mongoose from "mongoose";

export const getAllBlogs = async (req, res) => {
  try {
    const pipelines = [
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

      // Get all likes for each blog
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "blog",
          as: "likesDetails",
        },
      },

      // Optional comments lookup
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "blog",
          as: "commentsDetails",
        },
      },

      {
        $project: {
          title: 1,
          content: 1,

          author: {
            id: "$authorDetails._id",
            name: "$authorDetails.userName",
          },

          likes: {
            count: { $size: "$likesDetails" },
            users: "$likesDetails.user",
          },

          comments: {
            count: { $size: "$commentsDetails" },
            details: "$commentsDetails",
          },

          saveAs: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const blogs = await Blog.aggregate(pipelines);

    res.status(200).json({
      message: "Blogs retrieved successfully",
      blogs,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to retrieve blogs",
    });
  }
};
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const pipelines = [
      {
        $match: { author: new mongoose.Types.ObjectId(id) },
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
        $project: {
          title: 1,
          content: 1,

          author: {
            id: "$authorDetails._id",
            name: "$authorDetails.userName",
          },

          likes: {
            count: { $size: "$likesDetails" },
            users: "$likesDetails.user",
          },

          comments: {
            count: { $size: "$commentsDetails" },
            details: "$commentsDetails",
          },

          saveAs: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
    const blog = await Blog.aggregate(pipelines);
    console.log(blog);
    res.status(200).json({
      message: "Blog retrieved successfully",
      blog: blog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve blog",
    });
  }
};
export const createBlog = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const newBlog = new Blog({ title, content, author: authorId });
    console.log(newBlog);
    await newBlog.save();
    res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create blog" });
  }
};
