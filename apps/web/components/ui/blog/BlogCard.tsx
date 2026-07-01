"use client";

import BlogFooter from "./BlogFooter";
import BlogContent from "./BlogContent";
import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { message } from "antd";
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
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      queryClient.invalidateQueries({ queryKey: ["blogData", userId] });
      queryClient.invalidateQueries({ queryKey: ["saved"] });
    },
    onError: (error: any) => {
      const status = error?.response?.status;

      if (status === 400) {
        console.log("Already viewed");
      } else if (status === 404) {
        message.error("Blog not found");
      } else if (status === 401) {
        message.error("Login required");
      } else {
        message.error(error?.response?.data?.message || "Something went wrong");
      }
    },
  });
  const openBlog = useCallback(
    (blogId: { _id: string }) => {
      console.log(blogId)
      router.push(`/${role}/blogs/${blogId._id}`);
      requestIdleCallback(() => {
        viewMutation.mutate(blogId._id);
      });
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