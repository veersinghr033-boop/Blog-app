import { memo } from "react";
import { Card, Typography, message } from "antd";
import { LikeOutlined, CommentOutlined, SaveOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";

const {  Paragraph } = Typography;

interface ReaderBlogCardProps {
    post: any;
    onOpen: (blog: any) => void;
    onExpand: (id: string, value: boolean) => void;
    expanded: boolean;
    isLiked: boolean;
    isSaved: boolean;
    isCommented: boolean;
}

function ReaderBlogCard({
    post,
    onOpen,
    onExpand,
    expanded,
    isLiked,
    isSaved,
    isCommented,
}: ReaderBlogCardProps) {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id);

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

    return (
        <Card hoverable className="h-full rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex h-full flex-col gap-4">
                <div>
                    <title className="mb-3 line-clamp-2">
                        {post.title}
                    </title>
                    <Paragraph
                        ellipsis={{
                            rows: 3,
                            expandable: false,
                            onEllipsis: (ellipsis) => {
                                onExpand(post._id, ellipsis);
                            },
                        }}
                        className="text-gray-600"
                    >
                        {post.content}
                    </Paragraph>

                    {expanded && (
                        <text className="cursor-pointer text-blue-500 hover:text-blue-700" onClick={() => onOpen(post)}>
                            Read more
                        </text>
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
                                onClick={() => onOpen(post)}
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
        </Card>
    );
}

export default memo(ReaderBlogCard);
