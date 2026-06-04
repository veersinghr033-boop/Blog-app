import View from "../models/viewModel.js";
import Blog from "../models/BlogModel.js";

export const addView = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId } = req.params;
    console.log(userId , blogId)
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
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
