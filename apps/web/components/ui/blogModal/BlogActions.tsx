// "use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageCircle } from "lucide-react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useAppSelector } from "@/lib/store/hooks";
import api from "@/utills/axios";

interface Props {
    blog: any;
    onReport: () => void;
    onOpen: (blog: any) => void;
}

function BlogActions({ blog, onReport, onOpen }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const userId = useAppSelector(
        (state) => state.auth.user?._id
    );

    const isAuthor = blog.author?.id === userId;
    const isLiked = blog.isLiked;
    const isCommented = blog.isCommented;

    // -------------------- Report Query --------------------

    const { data: report = [] } = useQuery({
        queryKey: ["reportUser", blog?._id],
        enabled: !!blog?._id,
        queryFn: async () => {
            const res = await api.get(`/reports/user/${blog._id}`);
            return res.data.reports;
        },
    });

    const alreadyReported = report.some(
        (r: any) =>
            r.userId._id === userId &&
            r.blogId._id === blog._id
    );

    // -------------------- Like Mutation --------------------

    const likeMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/likes/${blog._id}`, {
                userId,
            });

            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });

            queryClient.invalidateQueries({
                queryKey: ["blogData", userId],
            });

            queryClient.invalidateQueries({
                queryKey: ["saved"],
            });

            queryClient.invalidateQueries({
                queryKey: ["blog"],
            });
        },

        onError: () => {
            toast.error("Failed to like blog");
        },
    });

    // -------------------- Delete Mutation --------------------

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/blogs/delete/${blog._id}`);
        },

        onSuccess: () => {
            toast.success("Blog deleted");

            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });

            queryClient.invalidateQueries({
                queryKey: ["blogData", userId],
            });

            queryClient.invalidateQueries({
                queryKey: ["saved"],
            });

            queryClient.invalidateQueries({
                queryKey: ["all"],
            });

            queryClient.invalidateQueries({
                queryKey: ["trending"],
            });

            router.back();
        },
    });


    const handleLikeClick = useCallback(() => {
        likeMutation.mutate();
    }, [likeMutation]);

    const handleOpen = useCallback(() => {
        onOpen(blog);
    }, [blog, onOpen]);

    const handleReport = useCallback(() => {
        onReport();
    }, [onReport]);

    const handleDelete = useCallback(() => {
        deleteMutation.mutate();
    }, [deleteMutation]);

    // -------------------- UI --------------------

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <p className="text-gray-600 dark:text-gray-400">
                    {blog?.createdAt &&
                        new Date(blog.createdAt).toLocaleDateString()}
                </p>

                <p
                    className={`flex items-center gap-1 text-sm cursor-pointer hover:text-blue-500 ${isLiked
                            ? "text-blue-500"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                    onClick={handleLikeClick}
                >
                    <ThumbsUp size={15} />
                    {blog.likes?.count || 0}
                </p>

                <p
                    className={`flex items-center gap-1 text-sm cursor-pointer hover:text-green-500 ${isCommented
                            ? "text-green-500"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                    onClick={handleOpen}
                >
                    <MessageCircle size={15} />
                    {blog.comments?.count || 0}
                </p>

                <span className="text-sm cursor-pointer hover:text-blue-500 text-gray-500 dark:text-gray-400">
                    {blog?.views?.count || 0} Views
                </span>
            </div>

            {isAuthor ? (
                <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                    Delete
                </button>
            ) : (
                <button
                    onClick={handleReport}
                    disabled={alreadyReported}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                    title={
                        alreadyReported
                            ? "You have already reported this blog"
                            : "Report this blog"
                    }
                >
                    {alreadyReported ? "Reported" : "Report"}
                </button>
            )}
        </div>
    );
}

export default memo(BlogActions);