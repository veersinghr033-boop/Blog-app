import mongoose from "mongoose";
import { use } from "react";

const commentSchema = new mongoose.Schema({
    comment:{
        type: String,
        required: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    blog:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    }
},{timestamps: true});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;