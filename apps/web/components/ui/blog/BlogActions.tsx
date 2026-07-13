// "use client";
import React from "react";
import { message } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { ThumbsUp, MessageCircle } from "lucide-react";


function BlogActions({ post, onOpen, userId }: any) {
  const queryClient = useQueryClient();
  const isLiked = post.isLiked;
  const isCommented = post.isCommented;
  const LikeMutation = useMutation({
    mutationFn: async (blogId: string) => {
      const res = await api.post(`/likes/${blogId}`, {
        userId: userId,
      });
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blogData", userId] });
    },

    onError: () => {
      message.error("Failed to like blog");
    },
  });

  const handleLike = (blogId: string) => {
      LikeMutation.mutate(blogId);
  };
  return (
    <>
      <span
        className={`flex items-center gap-1 text-sm cursor-pointer hover:text-blue-500 ${isLiked ? "text-blue-500" : "text-gray-500"
          }`}
        onClick={() => handleLike(post._id)}
      >
        <ThumbsUp size={15} /> {post.likes?.count || 0}
      </span>

      <span
        className={`flex items-center gap-1 text-sm cursor-pointer hover:text-green-500 ${isCommented ? "text-green-500" : "text-gray-500"
          }`}
        onClick={() => onOpen(post._id)}
      >
        <MessageCircle size={15} />{post.comments?.count || 0}
      </span>
      <span className="text-sm cursor-pointer hover:text-blue-500 text-gray-500">
        {post.views?.count || 0} Views
      </span>
    </>
  );
}
export default React.memo(BlogActions);