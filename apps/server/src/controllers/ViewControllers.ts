import View from "../models/viewModel.ts";
import Blog from "../models/BlogModel.ts";
import { Request, Response } from "express";


export const addView = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const { blogId } = req.params as { blogId: string };
    if (!blogId || !userId) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existingView = await View.findOne({
      blogId,
      userId,
    });
    if (existingView) {
      return res.status(400).json({
        message: "You already viewed this blog",
      });
    }

    const newView = await View.create({
      blogId,
      userId,
    });

    await Blog.findByIdAndUpdate(blogId, {
      $push: { views: newView._id },
    });

    res.status(201).json({
      view: newView,
      message: "View added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
