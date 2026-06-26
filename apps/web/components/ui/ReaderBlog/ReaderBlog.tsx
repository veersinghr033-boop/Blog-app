"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import ReaderBlogCard from "./ReaderBlogCard";
import { useRouter } from "next/navigation";

interface BlogProps {
    data: any[];
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
}

function ReaderBlog({ data, hasNextPage = false, isFetchingNextPage = false, fetchNextPage }: BlogProps) {
    const user = useAppSelector((state) => state.auth.user?.id);
    const queryClient = useQueryClient();
    const router = useRouter();
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const [expandedBlogs, setExpandedBlogs] = useState<Record<string, boolean>>({});

    const { data: savedBlogs = [] } = useQuery({
        queryKey: ["save"],
        queryFn: async () => {
            const response = await api.get("/blogsave/get");
            return response.data.blogs;
        },
        enabled: Boolean(user),
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
    });

    const savedIds = useMemo(
        () => new Set(savedBlogs.map((b: any) => b.blogDetails._id)),
        [savedBlogs]
    );
    const viewMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const response = await api.post(`/views/${blogId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog"] });
            queryClient.invalidateQueries({ queryKey: ["blogData", user] });
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

    const openBlogModal = useCallback(
        (blog: any) => {
            const blogId = blog?._id ?? blog?.id;
            if (!blogId) {
                console.warn("Missing blog id", blog);
                return;
            }

            router.prefetch(`/reader/blogs/${blogId}`);

            router.push(`/reader/blogs/${blogId}`);

            requestIdleCallback(() => {
                viewMutation.mutate(blogId);
            });
        },
        [router, viewMutation]
    );

    const handleExpand = useCallback((id: string, value: boolean) => {
        setExpandedBlogs((prev) => ({ ...prev, [id]: value }));
    }, []);

    useEffect(() => {
        if (!hasNextPage || !fetchNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry?.isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 0.2 }
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

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.map((blog) => {
                const blogId = blog?._id ?? blog?.id;
                const isLiked = blog.likes?.users?.includes(user);
                const isCommented = blog.comments?.details?.some((comment: any) => comment.user === user);

                return (
                    <ReaderBlogCard
                        key={blogId}
                        post={blog}
                        expanded={Boolean(expandedBlogs[blogId])}
                        onExpand={handleExpand}
                        onOpen={openBlogModal}
                        isLiked={Boolean(isLiked)}
                        isSaved={savedIds.has(blogId)}
                        isCommented={Boolean(isCommented)}
                    />
                );
            })}

            <div ref={loadMoreRef} className="col-span-full h-4" />

            {isFetchingNextPage ? (
                <div className="col-span-full py-4 text-center text-sm text-gray-500">Loading more blogs...</div>
            ) : null}
        </div>
    );
}

export default ReaderBlog;