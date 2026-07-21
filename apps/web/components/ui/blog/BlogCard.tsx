// "use client";

import BlogFooter from "./BlogFooter";
import BlogContent from "./BlogContent";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { toast } from "sonner";
import Image from "next/image";
import { FileText } from "lucide-react";
interface BlogCardProps {
  post: any;
  userId?: string;
  role?: string;
  index?: number;
}

function BlogCard({ post, role, userId, index }: BlogCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const viewMutation = useMutation({
    mutationFn: async (blogId: string) => {
      const response = await api.post(`/views/${blogId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogData", userId] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;

      if (status === 400) {
        console.log("Already viewed");
      } else if (status === 404) {
        toast.error("Blog not found");
      } else if (status === 401) {
        toast.error("Login required");
      } else {
      }
      console.error(error?.response?.data?.message || "Something went wrong");
    },
  });
  const openBlog = useCallback(
    (blogId: string) => {
      router.push(`/${role}/blogs/${blogId}`);
      requestIdleCallback(() => {
        viewMutation.mutate(blogId);
      });
    },
    [router, role]

  );

  return (
    <div className="w-full flex gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow">
      {post.image ? (
        <div className="relative w-1/3 max-w-md h-50 mb-6">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : undefined}
            sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw"
            className="rounded-lg object-cover"
          />
        </div>
      ) : (
        <div className="w-1/3 h-50 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400">
            <FileText />
          </div>

          <h3 className="mt-4 text-base font-medium text-gray-700 dark:text-gray-200 line-clamp-1 text-center px-5">
            {post.title}
          </h3>

          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Article Preview
          </p>
        </div>
      )}

      <div className="flex-1">
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
    </div>
  );
}

export default React.memo(BlogCard);