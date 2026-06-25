"use client";

import { useEffect, useRef, useState } from "react";
import { message } from "antd";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

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
function ReaderBlog({ data, hasNextPage = false,
    isFetchingNextPage = false,
    fetchNextPage, }: BlogProps) {
    const user = useAppSelector(
        (state) => state.auth.user?.id
    );

    const queryClient = useQueryClient();
    const router = useRouter();
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const [expandedBlogs, setExpandedBlogs] = useState<
        Record<string, boolean>
    >({});


    const viewMutation = useMutation({
        mutationFn: async (blogId: string) => {
            console.log("blogId", blogId)

            const response = await api.post(`/views/${blogId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });
            queryClient.invalidateQueries({
                queryKey: ["blogData", user],
            });
            queryClient.invalidateQueries({
                queryKey: ["saved"],
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
                message.error(
                    error?.response?.data?.message ||
                    "Something went wrong"
                );
            }
        }
    });

    const openBlogModal = (blog: any) => {
        const blogId = blog?._id ?? blog?.id;
        if (!blogId) {
            console.warn("Missing blog id", blog);
            return;
        }

        // console.log("BlogData", blog);
        router.push(`/reader/blogs/${blogId}`);
        viewMutation.mutate(blogId);
    };

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
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.map((blog) => {
                    const blogId = blog?._id ?? blog?.id;

                    return (
                        <ReaderBlogCard
                            key={blogId}
                            post={blog}
                            expanded={expandedBlogs[blogId]}
                            onExpand={(id, value) =>
                                setExpandedBlogs((prev) => ({
                                    ...prev,
                                    [id]: value,
                                }))
                            }
                            onOpen={openBlogModal}
                        />
                    );
                })}

                <div ref={loadMoreRef} className="col-span-full h-4" />

                {isFetchingNextPage ? (
                    <div className="col-span-full text-center py-4 text-sm text-gray-500">
                        Loading more blogs...
                    </div>
                ) : null}
            </div>
        </>
    );
}

export default ReaderBlog;