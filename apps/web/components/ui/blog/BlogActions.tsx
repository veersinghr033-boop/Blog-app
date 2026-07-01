"use client";
import React from "react";
import { message } from "antd"
import { LikeOutlined, CommentOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";


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
      queryClient.setQueryData(["blogs"], (oldData: any) => {
          if (!oldData) return oldData
          const updatedBlogs = oldData.map((blog: any) => {
            if (blog._id === post._id) {
              return {
                ...blog,
                isLiked: !blog.isLiked,
                likes: {
                  ...blog.likes,
                  count: blog.isLiked ? blog.likes.count - 1 : blog.likes.count + 1,
                },
              };
            
            }
            return blog;
          });
          return updatedBlogs;
        })
     

      queryClient.invalidateQueries({
        queryKey: ["blogData", userId],
      });
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
        <LikeOutlined /> {post.likes?.count || 0}
      </span>

      <span
        className={`flex items-center gap-1 text-sm cursor-pointer hover:text-green-500 ${isCommented ? "text-green-500" : "text-gray-500"
          }`}
        onClick={() => onOpen(post)}
      >
        <CommentOutlined />{post.comments?.count || 0}
      </span>
      <span className="text-sm cursor-pointer hover:text-blue-500 text-gray-500">
        {post.views && post.views.length > 0 ? post.views[0].count : 0} Views
      </span>
    </>
  );
}
export default React.memo(BlogActions);