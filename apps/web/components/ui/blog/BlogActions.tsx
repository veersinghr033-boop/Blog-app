import {
    LikeOutlined,
    CommentOutlined,
} from "@ant-design/icons";
import { Typography , message } from "antd";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";

const { Text } = Typography;

export default function BlogActions({
    post,
    onOpen,
}: any) {

    const user = useAppSelector((state) => state.auth.user?.id);
    const queryClient = useQueryClient();
    const isLiked =
        post.likes?.users?.includes(user);

    const isCommented =
        post.comments?.details?.some(
            (comment: any) =>
                comment.user === user
        );
    const LikeMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const res = await api.post(`/likes/${blogId}`, {
                userId: user,
            });

            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });

            queryClient.invalidateQueries({
                queryKey: ["blogData", user],
            });
        },

        onError: () => {
            message.error("Failed to like blog");
        },
    });

    const handleLike = (blogId: string) => {
        LikeMutation.mutate(blogId);
    };
    return (
        <>
            <Text
                className={`text-sm cursor-pointer hover:text-blue-500 ${isLiked ? "text-blue-500!" : "text-gray-500!"
                    }`}
                onClick={() => handleLike(post._id)}
            >
                {post.likes?.count || 0}
                <LikeOutlined />
            </Text>

            <Text
                className={`flex items-center gap-1 text-sm cursor-pointer hover:text-blue-500 ${isCommented ? "text-green-500!" : "text-gray-500!"
                    }`}
                onClick={() => onOpen(post)}
            >
                {post.comments?.count || 0}
                <CommentOutlined />
            </Text>
            <Text
                className="text-sm cursor-pointer hover:text-blue-500 text-gray-500"
            >
                {post.views && post.views.length > 0 ? post.views[0].count : 0} Views
            </Text>
            
            
        </>
    );
}