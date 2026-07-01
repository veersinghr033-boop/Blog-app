import { memo, useCallback } from "react";
import {  message } from "antd";
import { LikeOutlined, CommentOutlined, SaveOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";
interface ReaderBlogCardProps {
    post: any;
    userId: string;
    isSaved: boolean;
  
}

function ReaderBlogCard({
    post,
    userId,
    isSaved,
    
}: ReaderBlogCardProps) {
    const isLiked = post.likes?.users?.includes(userId);
    const isCommented = post.comments?.details?.some((comment: any) => comment.user === userId);
    const queryClient = useQueryClient();
    const router = useRouter()
    const LikeMutation = useMutation({
        mutationFn: async (blogId: string) => api.post(`/likes/${blogId}`, { userId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
            queryClient.invalidateQueries({ queryKey: ["save"] });
            queryClient.invalidateQueries({ queryKey: ["saved"] });
        },
    });

    const SaveMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const alreadySaved = isSaved;
            await api.post("/blogsave", { blogId });
            return { alreadySaved };
        },
        onSuccess: ({ alreadySaved }) => {
            if (alreadySaved) {
                message.warning("Blog unsaved");
            } else {
                message.success("Blog saved");
            }

            queryClient.invalidateQueries({ queryKey: ["save"] });
            queryClient.invalidateQueries({ queryKey: ["saved"] });
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
        },
    });
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

    const openBlogModal = useCallback(
        (blog: any) => {
            const blogId = blog
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
    const showReadMore = post.content?.length > 150;

    return (
        <div className="h-full rounded-lg border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow border-gray-200 shadow-sm">
            <div className="flex h-full flex-col gap-4">
                <div>
                    <h2  className="font-semibold text-2xl mb-2  line-clamp-2">
                        {post.title}
                    </h2>
                    <p className="line-clamp-3">
                        {post.content}
                    </p>

                    {showReadMore && (
                        <span
                            className="text-blue-500 cursor-pointer"
                            onClick={() => openBlogModal(post._id)}
                        >
                            Read more
                        </span>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs uppercase text-white">
                                {post.author?.userName?.charAt(0) || "U"}
                            </div>
                            <text >{post.author?.userName || "Unknown"}</text>
                        </div>
                        <text className="text-xs text-gray-400" >
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                        </text>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <text
                                className={`cursor-pointer transition-colors ${isLiked ? "text-blue-500!" : "text-gray-500 hover:text-blue-500"}`}
                                onClick={() => LikeMutation.mutate(post._id)}
                            >
                                {post.likes?.count || 0} <LikeOutlined />
                            </text>
                            <text
                                className={`flex items-center gap-1 cursor-pointer transition-colors ${isCommented ? "text-green-500!" : "text-gray-500 hover:text-green-500"}`}
                                onClick={() => openBlogModal(post)}
                            >
                                {post.comments?.count || 0} <CommentOutlined />
                            </text>
                            <text>{post.views && post.views.length > 0 ? post.views[0].count : 0} Views</text>
                        </div>
                        <SaveOutlined
                            className={`cursor-pointer text-lg transition-colors ${isSaved ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
                            onClick={() => SaveMutation.mutate(post._id)}
                            title={isSaved ? "Unsave" : "Save"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(ReaderBlogCard);
