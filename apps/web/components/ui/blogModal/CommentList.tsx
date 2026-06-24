import {
    Button,
    Popconfirm,
    Typography,
    message,
    Input,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import CommentReply from "./commentReply";
import { Virtuoso } from "react-virtuoso";

const { Paragraph, Text } = Typography;

interface Props {
    comments: any[];
    blogId: string;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
}

export default function CommentList({
    comments,
    blogId,
    hasNextPage = false,
    isFetchingNextPage = false,
    fetchNextPage,
}: Props) {
    const queryClient = useQueryClient();

    const user = useAppSelector((state) => state.auth.user?.id);
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: string) => {
            await api.delete(`/comments/${commentId}`);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["comments", blogId],
            });
            queryClient.invalidateQueries({
                queryKey: ["blogData"],
            });
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });
            queryClient.invalidateQueries({
                queryKey: ["saved"],
            });
            queryClient.invalidateQueries({
                queryKey: ["blog"],
            });

            message.success("Comment deleted");
        },
    });

    const handleDeleteComment = (commentId: string) => {
        deleteCommentMutation.mutate(commentId);
    };

    if (!comments.length) {
        return (
            <div className="text-center py-4">
                <Text type="secondary">
                    No comments yet
                </Text>
            </div>
        );
    }

    return (
        <>
            <div className="h-72">
                <Virtuoso
                    data={comments}
                    endReached={() => {
                        if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
                            fetchNextPage();
                        }
                    }}
                    components={{
                        Footer: () =>
                            isFetchingNextPage ? (
                                <div className="text-center py-2">
                                    Loading more comments...
                                </div>
                            ) : null,
                    }}
                    itemContent={(_, comment) => (
                        <div
                            key={comment._id}
                            className="border border-gray-200 rounded-lg p-3 mb-2"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1 text-start">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs uppercase">
                                            {comment.user?.name?.charAt(0)}
                                        </div>

                                        <Text strong>
                                            {comment.user?.name}
                                        </Text>

                                        <Text type="secondary">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </Text>
                                    </div>

                                    <Text className="text-gray-700! pl-8">
                                        {comment.comment}
                                    </Text>
                                </div>
                            </div>

                            <CommentReply
                                comment={comment}
                                blogId={blogId}
                            />
                        </div>
                    )}
                />
            </div>
        </>
    );
}