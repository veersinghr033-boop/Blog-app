import {
    Button,
    Popconfirm,
    message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import CommentReply from "./commentReply";
import { Virtuoso } from "react-virtuoso";


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

    const currentUser = useAppSelector((state) => state.auth.user);
    const currentUserId = currentUser?._id || currentUser?.id;
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

    const isCommentOwner = (comment: any) => {
        const commentUserId = comment?.user?._id || comment?.user?.id;

        return Boolean(
            currentUserId &&
            commentUserId &&
            String(currentUserId) === String(commentUserId)
        );
    };

    if (!comments.length) {
        return (
            <div className="text-center py-4">
                <p >
                    No comments yet
                </p>
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
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1 text-start">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs uppercase">
                                            {comment.user?.name?.charAt(0)}
                                        </div>

                                        <p >
                                            {comment.user?.name}
                                        </p>

                                        <p >
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <p className="text-gray-700! pl-8">
                                        {comment.comment}
                                    </p>
                                </div>

                                {isCommentOwner(comment) && (
                                    <Popconfirm
                                        title="Delete comment?"
                                        description="Are you sure you want to delete this comment?"
                                        onConfirm={() => handleDeleteComment(comment._id)}
                                        okText="Delete"
                                        cancelText="Cancel"
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            size="small"
                                        />
                                    </Popconfirm>
                                )}
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