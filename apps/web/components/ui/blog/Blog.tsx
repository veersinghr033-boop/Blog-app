"use client";

import { useState } from "react";
import { message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import api from "@/utills/axios";
import BlogCard from "./BlogCard";
import { useAppSelector } from "@/lib/store/hooks";

interface BlogProps {
    data: any[];
}

function Blog({ data }: BlogProps) {
    const router = useRouter();

    const queryClient = useQueryClient();

    const [expandedBlogs, setExpandedBlogs] =
        useState<Record<string, boolean>>({});

    const user = useAppSelector(
        (state) => state.auth.user?.id
    );
    const userRole = useAppSelector(
        (state) => state.auth.user?.role
    );

    const viewMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const response = await api.post(
                `/views/${blogId}`
            );

            return response.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
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
                message.error(
                    error?.response?.data?.message ||
                    "Something went wrong"
                );
            }
        }
    });

    const openBlog = (
        blog: any
    ) => {
        viewMutation.mutate(
            blog._id
        );

        router.push(
            `/${userRole}/blogs/${blog._id}`
        );
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            {data.map((post) => (
                <BlogCard
                    key={post._id}
                    post={post}
                    expanded={
                        expandedBlogs[
                        post._id
                        ]
                    }
                    onExpand={(
                        id,
                        value
                    ) =>
                        setExpandedBlogs(
                            (
                                prev
                            ) => ({
                                ...prev,
                                [id]:
                                    value,
                            })
                        )
                    }
                    onOpen={
                        openBlog
                    }
                />
            ))}
        </div>
    );
}

export default Blog;