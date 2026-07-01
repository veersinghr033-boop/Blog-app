
"use client";
import BlogActions from "./BlogActions";
import React from "react";

function BlogFooter({ post, userId, onOpen }: any) {
  return (
    <div className="flex justify-between mt-4">
      <div className="flex items-center gap-2">
        <div className="bg-gray-700 text-white rounded-full w-7 h-7 flex items-center justify-center">
          {post.author?.userName?.charAt(0)}
        </div>

        <span className="text-gray-800">{post.author?.userName}</span>

        <BlogActions post={post} onOpen={onOpen} userId={userId} />
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          className="text-gray-600 px-2 py-1"
          aria-label="more"
          onClick={() => onOpen(post._id)}
        >
          ⋯
        </button>

        <div className="text-gray-500 text-xs">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
export default React.memo(BlogFooter);