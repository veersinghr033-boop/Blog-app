"use client";

import BlogFooter from "./BlogFooter";
import BlogContent from "./BlogContent";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";

interface BlogCardProps {
  post: any;
  userId?: string;
  role?: string;
}

function BlogCard({ post,role,userId }: BlogCardProps) {
  const router = useRouter();

  const openBlog = useCallback(
    (blogId: string) => {
      router.push(`/${role}/blogs/${blogId}`);
    },
    [router, role]
  );

  return (
    <div className="w-full bg-white p-5 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow">
      <BlogContent
        post={post}
        onOpen={openBlog}
      />

      <BlogFooter
        post={post}
        onOpen={openBlog}
        userId={userId}
      />
    </div>
  );
}

export default React.memo(BlogCard);