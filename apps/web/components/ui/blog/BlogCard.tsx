import BlogFooter from "./BlogFooter";
import BlogContent from "./BlogContent";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";

interface BlogCardProps {
  post: any;
}

function BlogCard({ post }: BlogCardProps) {
  const router = useRouter();
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const openBlog = useCallback(
    (blogId: string) => {
      router.push(`/${userRole}/blogs/${blogId}`);
    },
    [router, userRole]
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
      />
    </div>
  );
}

export default React.memo(BlogCard);