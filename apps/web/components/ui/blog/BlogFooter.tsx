
// "use client";
import BlogActions from "./BlogActions";
import React from "react";
import Image from "next/image";
import ViewProfile from "../ViewProfile"
import { useState } from "react";
function BlogFooter({ post, userId, onOpen }: any) {
  if (!post) return null;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-between mt-4">
      <div className="flex items-center gap-6" >

        <div className="flex items-center gap-2   cursor-pointer" onClick={() => setIsOpen(true)}>
          {post.author?.profileImage ? (
            <div className="relative h-12 w-12">
              <Image
                src={post.author.profileImage}
                alt={post.author.userName}
                fill
                sizes="48px"
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center capitalize font-semibold " >
              {post.author?.userName?.charAt(0)}
            </div>
          )}

          <span className="text-gray-800 dark:text-gray-200">
            {post.author?.userName}
          </span>
        </div>

        <BlogActions
          post={post}
          onOpen={onOpen}
          userId={userId}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white px-2 py-1"
          aria-label="more"
          onClick={() => onOpen(post._id)}
        >
          ⋯
        </button>

        <div className="text-gray-500 dark:text-gray-400 text-xs">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>
      {isOpen && (
        <ViewProfile
          userId={post.author?.id}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
    </div>
  );
}
export default React.memo(BlogFooter);