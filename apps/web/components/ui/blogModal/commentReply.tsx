// "use client";


import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useState, } from "react";
import { toast } from "sonner";


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

            toast.success("Reply added");
            setReplyText((prev) => ({
                ...prev,
                [openReply!]: "",
            }));
            setOpenReply(null);
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            if (status === 400) {
                toast.warning("Reply cannot be empty");
            } else if (status === 404) {
                toast.error("Comment not found");
            } else if (status === 401) {
                toast.error("Login required");
            } else {
                toast.error(
                    error?.response?.data?.toast ||
                    "Something went wrong"
                );
            }
        },
    });
    return (
        <div>
            <div className="flex items-center gap-4 pl-8">
                <p
                    className="text-xs cursor-pointer hover:underline text-gray-600 dark:text-gray-400"
                    onClick={() =>
                        setOpenReply(
                            openReply === comment._id ? null : comment._id
                        )
                    }
                >
                    Reply
                </p>

                <p
                    className="text-xs cursor-pointer hover:underline text-gray-600 dark:text-gray-400"
                    onClick={() =>
                        setOpenReplyData(
                            openReplyData === comment._id ? null : comment._id
                        )
                    }
                >
                    {comment.replies?.length || 0} replies
                </p>
            </div>

            {openReply === comment._id && (
                <form
                    className="pl-8 mt-3 flex gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (!replyText[comment._id]?.trim()) {
                            toast.warning("Reply cannot be empty");
                            return;
                        }

                        replyMutation.mutate({
                            commentId: comment._id,
                            text: replyText[comment._id],
                        });
                    }}
                >
                    <input
                        placeholder="Write a reply..."
                        value={replyText[comment._id] || ""}
                        onChange={(e: any) =>
                            setReplyText((prev) => ({
                                ...prev,
                                [comment._id]: e.target.value,
                            }))
                        }
                        className="flex-1 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white p-2 rounded"
                    />

                    <button
                        type="submit"
                        disabled={replyMutation.isPending}
                        className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                        Send
                    </button>
                </form>
            )}

            {openReplyData === comment._id && (
                <div className="pl-8 mt-3 flex flex-col gap-2">
                    {replies.length ? (
                        replies.map((reply: any) => (
                            <div
                                key={reply._id}
                                className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg p-3"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1 text-start">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-gray-700 dark:bg-zinc-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs uppercase">
                                                {reply.userId?.userName?.charAt(0)}
                                            </div>

                                            <p className="text-black dark:text-white">
                                                {reply.userId?.userName}
                                            </p>

                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                {new Date(
                                                    reply.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <p className="pl-8 text-gray-700 dark:text-gray-300">
                                            {reply.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="pl-8 text-gray-500 dark:text-gray-400">
                            No replies yet
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default CommentReply
