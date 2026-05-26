import mongoose from "mongoose";

const blogSaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  },
  { timestamps: true },
);

const BlogSave = mongoose.model("BlogSave", blogSaveSchema);

export default BlogSave;