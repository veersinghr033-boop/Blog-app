import { Button, Input, Typography, message } from "antd";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useState, } from "react";
const { Paragraph, Text } = Typography;

function CommentReply({ comment, blogId }: { comment: any; blogId: string }) {
    const [openReply, setOpenReply] = useState<string | null>(null);
    const [openReplyData, setOpenReplyData] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const { data: replies = [], isLoading } = useQuery({
        queryKey: ["replies", comment._id],
        enabled: openReplyData === comment._id,
        queryFn: async () => {
            const response = await api.get(
                `/replies/${comment._id}`
            );

            return response.data.replies;
        },
    });


    const replyMutation = useMutation({
        mutationFn: async ({ commentId, text }: { commentId: string; text: string; }) => {
            return api.post(`/replies/${commentId}`, { text, });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["comments", blogId],
            });
            queryClient.invalidateQueries({
                queryKey: ["replies", comment._id],
            });

            message.success("Reply added");
            setReplyText((prev) => ({
                ...prev,
                [openReply!]: "",
            }));
            setOpenReply(null);
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 400) {
                message.warning("Reply cannot be empty");
            } else if (status === 404) {
                message.error("Comment not found");
            } else if (status === 401) {
                message.error("Login required");
            } else {
                message.error(
                    error?.response?.data?.message ||
                    "Something went wrong"
                );
            }
        },
    });
    return (
        <div  >
            <div className="flex items-center gap-4 pl-8 ">
                <Text type="secondary" className="text-xs cursor-pointer hover:underline"
                    onClick={() => setOpenReply(
                        openReply === comment._id ? null : comment._id
                    )}>
                    reply
                </Text>

                <Text type="secondary" className="text-xs cursor-pointer hover:underline" onClick={() => setOpenReplyData(
                    openReplyData === comment._id ? null : comment._id
                )}>
                    {comment.replies?.length || 0} replies
                </Text>
            </div>
            {openReply === comment._id && (
                <div className="pl-8 mt-3 flex gap-2">
                    <Input
                        placeholder="Write a reply..."
                        value={
                            replyText[comment._id] || ""
                        }
                        onChange={(e: any) =>
                            setReplyText((prev) => ({
                                ...prev, [comment._id]: e.target.value
                            }))
                        }
                    />

                    <Button
                        type="primary"
                        onClick={() =>
                            replyMutation.mutate({
                                commentId:
                                    comment._id,
                                text:
                                    replyText[
                                    comment._id
                                    ],
                            })
                        }
                        loading={
                            replyMutation.isPending
                        }
                    >
                        Send
                    </Button>
                </div>
            )}
            {openReplyData === comment._id && (
                <div className="pl-8 mt-3 flex flex-col gap-2">
                    {replies.length ? (
                        replies.map((reply: any) => (
                            <div
                                key={reply._id}
                                className="border border-gray-200 rounded-lg p-3 "
                            >
                                <div className="flex items-start justify-between gap-4 ">
                                    <div className="flex flex-col gap-1 text-start">
                                        <div className="flex items-center  gap-2 ">
                                            <div className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs uppercase">
                                                {reply.userId?.userName?.charAt(0)}
                                            </div>
                                            <Text strong>
                                                {reply.userId?.userName}
                                            </Text>
                                            <Text type="secondary">
                                                {new Date(
                                                    reply.createdAt
                                                ).toLocaleDateString()}
                                            </Text>
                                        </div>

                                        <Text className="text-gray-700! pl-8">
                                            {reply.text}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Text type="secondary" className="pl-8">
                            No replies yet
                        </Text>
                    )}
                </div>
            )}

        </div>
    )
}

export default CommentReply
