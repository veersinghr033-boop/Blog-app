"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { message, Typography  } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import api from "@/utills/axios";
import BlogCard from "./BlogCard";
import { useAppSelector } from "@/lib/store/hooks";

interface BlogProps {
  data: any[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}
function Blog({
  data,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: BlogProps) {
  const router = useRouter();

  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { Paragraph, Text } = Typography;

  const [expandedBlogs, setExpandedBlogs] = useState<Record<string, boolean>>(
    {},
  );

  const user = useAppSelector((state) => state.auth.user?.id);
  const userRole = useAppSelector((state) => state.auth.user?.role);

  const viewMutation = useMutation({
    mutationFn: async (blogId: string) => {
      const response = await api.post(`/views/${blogId}`);

      return response.data;
    },

    onSuccess: () => {
      queryClient.setQueryData(["blogs"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            blogs: page.blogs.map((blog: any) =>
              blog._id === blog._id
                ? {
                  ...blog,
                  views: blog.views + 1,
                }
                : blog
            ),
          })),
        };
      });

      queryClient.invalidateQueries({
        queryKey: ["blogData", user],
      });
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

  const openBlog = useCallback((blog: any) => {
    viewMutation.mutate(blog._id);
    router.push(`/${userRole}/blogs/${blog._id}`);
  }, [router, userRole, viewMutation]);
  useEffect(() => {
    if (!hasNextPage || !fetchNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.2 },
    );

    const current = loadMoreRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const handleExpand = useCallback((id: string, value: boolean) => {
    setExpandedBlogs(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);
  if (!data.length) {
    return (
      <div className="text-center py-4">
        <text type="secondary">
          No comments yet
        </text>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 pt-4 ">
      {data.map((post) => (
        <BlogCard
          key={post._id}
          post={post}
          expanded={expandedBlogs[post._id]}
          onExpand={handleExpand}

          onOpen={openBlog}
        />
      ))}
      <div ref={loadMoreRef} className="col-span-full h-4" />

      {isFetchingNextPage ? (
        <div className="col-span-full text-center py-4 text-sm text-gray-500">
          Loading more blogs...
        </div>
      ) : null}
    </div>
  );
}

export default Blog;
