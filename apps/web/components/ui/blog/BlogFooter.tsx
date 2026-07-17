
// "use client";
import BlogActions from "./BlogActions";
import React from "react";
import Image from "next/image";
function BlogFooter({ post, userId, onOpen }: any) {
  return (
    <div className="flex justify-between mt-4">
      <div className="flex items-center gap-2">
        {post.author?.profileImage ? (
          // <div className="relative h-8 w-8 rounded-full overflow-hidden">
          <div className="relative h-12 w-12">
            <Image
              src={post.author.profileImage}
              alt={post.author.userName}
              fill
              sizes="48px"
              className="rounded-full object-cover"
            />
            {/* </div> */}
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center capitalize font-semibold">
            {post.author?.userName?.charAt(0)}
          </div>
        )}


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