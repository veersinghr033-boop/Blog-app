import { Card, Typography , message} from "antd";
import { LikeOutlined, CommentOutlined, SaveOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQueryClient , useQuery } from "@tanstack/react-query";
import api from "@/utills/axios";

const { Title, Paragraph, Text } = Typography;

interface ReaderBlogCardProps {
    post: any;
    
    onOpen: (blog: any) => void;
    onExpand: (id: string, value: boolean) => void;
    expanded: boolean;
}

export default function ReaderBlogCard({
    post,
   
    onOpen,
    onExpand,
    expanded,
}: ReaderBlogCardProps) {
    const queryClient = useQueryClient();
    const user = useAppSelector((state) => state.auth.user?.id);
const { data: savedBlogs = [] } = useQuery({
        queryKey: ["save"],
        queryFn: async () => {
            const response = await api.get(
                "/blogsave/get"
            );

            return response.data.blogs;
        },
    });
    const savedIds =
        savedBlogs?.map(
            (item: any) => item.blogDetails?._id
        ) || [];
    const isLiked = post.likes?.users?.includes(user);
    const isSaved = savedIds.includes(post._id);
    const isCommented = post.comments?.details?.some(
        (comment: any) => comment.user === user
    );
    

    const LikeMutation = useMutation({
        mutationFn: async (blogId: string) => {
            return api.post(`/likes/${blogId}`, {
                userId: user,
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });

            queryClient.invalidateQueries({
                queryKey: ["save"],
            });
            queryClient.invalidateQueries({
                queryKey: ["saved"],
            })
        },
    });

    const SaveMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const alreadySaved = savedIds.includes(blogId);

            await api.post("/blogsave", {
                blogId,
            });

            return { alreadySaved };
        },

        onSuccess: ({ alreadySaved }) => {
            if (alreadySaved) {
                message.warning("Blog unsaved");
            } else {
                message.success("Blog saved");
            }

            queryClient.invalidateQueries({
                queryKey: ["save"],
            });

            queryClient.invalidateQueries({
                queryKey: ["saved"],
            });

            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });
        },
    });

    return (
        <Card hoverable className="rounded-2xl border border-gray-200 shadow-sm h-full!">
            <div className="flex flex-col h-full gap-4">
                <div>
                    <Title level={4} className="mb-3 line-clamp-2">
                        {post.title}
                    </Title>
                    <Paragraph
                        ellipsis={{
                            rows: 3,
                            expandable: false,
                            onEllipsis: (ellipsis) => {
                                onExpand(post._id, ellipsis);
                            },
                        }}
                        className="text-gray-600 "
                    >
                        {post.content}
                    </Paragraph>

                    {expanded && (
                        <Text
                            className="text-blue-500! hover:text-blue-700! cursor-pointer"
                            onClick={() => onOpen(post)}
                        >
                            Read more
                        </Text>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs uppercase">
                                {post.author?.userName?.charAt(0) || "U"}
                            </div>
                            <Text strong>{post.author?.userName || "Unknown"}</Text>
                        </div>
                        <Text className="text-gray-400 text-xs" title={post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}>
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                        </Text>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <Text
                                className={`cursor-pointer transition-colors ${isLiked ? "text-blue-500!" : "text-gray-500 hover:text-blue-500!"}`}
                                onClick={() => LikeMutation.mutate(post._id)}
                            >
                                {post.likes?.count || 0} <LikeOutlined />
                            </Text>
                            <Text
                                className={`flex items-center gap-1 cursor-pointer transition-colors ${isCommented ? "text-green-500!" : "text-gray-500 hover:text-green-500!"}`}
                                onClick={() => onOpen(post)}
                            >
                                {post.comments?.count || 0} <CommentOutlined />
                            </Text>
                            <Text

                            >
                                {post.views && post.views.length > 0 ? post.views[0].count : 0} Views
                            </Text>
                        </div>
                        <SaveOutlined
                            className={`text-lg cursor-pointer transition-colors ${isSaved ? "text-blue-500!" : "text-gray-400 hover:text-blue-500!"}`}
                            onClick={() => SaveMutation.mutate(post._id)}
                            title={isSaved ? "Unsave" : "Save"}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}
