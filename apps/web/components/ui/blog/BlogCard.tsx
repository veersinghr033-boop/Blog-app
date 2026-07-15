// "use client";

import BlogFooter from "./BlogFooter";
import BlogContent from "./BlogContent";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { toast } from "sonner";
import Image from "next/image";
interface BlogCardProps {
  post: any;
  userId?: string;
  role?: string;
}

function BlogCard({ post, role, userId }: BlogCardProps) {
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
      toast.error(error?.response?.data?.message || "Something went wrong");
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
    <div className="w-full flex gap-2 bg-white p-5 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow">
      <div className="relative w-100 h-48 mb-6">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width:768px)100vw,33vw"
          className="object-cover rounded-lg"
        />
      </div>
      <div>

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