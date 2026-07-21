// "use client";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { toast } from "sonner";


interface Props {
    blog: any;
    onReport: () => void;
    onOpen: (blog: any) => void;
}

export default function BlogActions({ blog, onReport, onOpen }: Props) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const userId = useAppSelector((state) => state.auth.user?._id);

    const isAuthor = blog.author?.id === userId;
    const { data: report = [] } = useQuery({
        queryKey: ["reportUser", blog?._id],
        enabled: !!blog?._id,
        queryFn: async () => {
            const res = await api.get(`/reports/user/${blog._id}`);
            return res.data.reports;
        },
    });

    const alreadyReported =
        report &&
        report.some(
            (r: any) => r.userId._id === userId && r.blogId._id === blog._id,
        );

    const isLiked = blog.isLiked;
    const isCommented = blog.isCommented;
    const LikeMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const res = await api.post(`/likes/${blogId}`, {
                userId: userId,
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

    const handleLike = (blogId: string) => {
        LikeMutation.mutate(blogId);
    };

    const deleteMutation = useMutation({
        mutationFn: async (blogId: string) => {
            await api.delete(`/blogs/delete/${blogId}`);
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
                queryKey: ["trending"]
            })

        },
    });

    const handleDelete = () => {
        deleteMutation.mutate(blog._id);

        router.back();
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <p>
                    {blog?.createdAt && new Date(blog.createdAt).toLocaleDateString()}
                </p>
                <p
                    className={`flex items-center gap-1 text-sm cursor-pointer hover:text-blue-500  ${isLiked ? "text-blue-500" : "text-gray-500"
                        }`}
                    onClick={() => handleLike(blog._id)}
                >
                    <ThumbsUp size={15} />  {blog.likes?.count || 0}
                </p>

                <p
                    className={`flex items-center gap-1 text-sm cursor-pointer hover:text-green-500 ${isCommented ? "text-green-500" : "text-gray-500"
                        }`}
                    onClick={() => onOpen(blog)}
                >
                    <MessageCircle size={15} /> {blog.comments?.count || 0}
                </p>
                <span className="text-sm cursor-pointer hover:text-blue-500 text-gray-500">
                    {blog?.views?.count || 0} Views
                </span>
            </div>

            {isAuthor ? (
                <button onClick={handleDelete} disabled={deleteMutation.isPending} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
            ) : (
                <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => onReport()}
                    disabled={alreadyReported}
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
