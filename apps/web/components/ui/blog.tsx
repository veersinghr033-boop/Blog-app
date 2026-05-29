"use client"
import { Card, Tag, Typography, message, Button } from "antd"
import { EllipsisOutlined, LikeOutlined, CommentOutlined } from "@ant-design/icons"
import api from "@/utills/axios"
import { useState } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import CommentModal from "@/components/ui/comment"
import BlogModal from "@/components/ui/blogModal"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


const { Title, Paragraph, Text } = Typography

function Blog({ data }: { data: any[] }) {
    const [open, setOpen] = useState(false)
    const [blogOpen, setBlogOpen] = useState(false)
    const [expandedBlogs, setExpandedBlogs] = useState<Record<string, boolean>>({})
    const [selectedBlogData, setSelectedBlogData] = useState<any>(null)
    const [selectedBlog, setSelectedBlog] = useState("")
    const user = useAppSelector((state) => state.auth.user?.id)
    const queryClient = useQueryClient();

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
        onError: (error) => {
            console.error("Error liking blog:", error);
            message.error("Failed to like blog");
        },
    });
    const handleLike = async (blogId: string) => {
        LikeMutation.mutate(blogId)

    }
    const handleComment = (blogId: string) => {

        setSelectedBlog(blogId)

        setOpen(true)
    }

    console.log(data)
    return (
        <>
            <div className="flex flex-col gap-4 pt-4">

                {data.map((post, index) => {
                    const isLiked =
                        post.likes?.users?.includes(user)

                    const isCommented =
                        post.comments?.details?.some(
                            (comment: any) =>
                                comment.user === user
                        )
                    return (
                        <Card
                            key={post._id || index}
                            hoverable
                            className="w-full rounded-2xl border border-gray-200 shadow-sm"
                        >
                            <Card.Meta
                                title={
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <Title
                                            level={4}
                                            className="!mb-0"
                                        >
                                            {post.title}
                                        </Title>
                                    </div>
                                }
                                description={
                                    <div className=" md:flex md:flex-col justify-between items-start gap-4 mt-3">

                                        <Paragraph
                                            ellipsis={{
                                                rows: 3,
                                                onEllipsis: (ellipsis) => {
                                                    setExpandedBlogs((prev) => ({
                                                        ...prev,
                                                        [post._id]: ellipsis,
                                                    }))
                                                },
                                            }}
                                        >
                                            {post.content}
                                        </Paragraph>

                                        {expandedBlogs[post._id] && (
                                            <Text
                                                className="text-blue-500! hover:text-blue-700! cursor-pointer"
                                                onClick={() => {
                                                    setSelectedBlogData(post)
                                                    setBlogOpen(true)
                                                }}
                                            >
                                                Read more
                                            </Text>
                                        )}

                                        <div className="flex items-center justify-between w-full gap-2">

                                            <div className="flex items-center gap-2">

                                                <div className="bg-gray-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs uppercase">
                                                    {post.author?.userName?.charAt(0)}
                                                </div>

                                                <Text>
                                                    {post.author?.userName}
                                                </Text>

                                                <Text
                                                    className={`text-sm cursor-pointer hover:text-blue-500 ${isLiked ? "text-blue-500!" : "text-gray-500!"
                                                        }`}
                                                    onClick={() => handleLike(post._id)}
                                                >
                                                    {post.likes?.count || 0} <LikeOutlined />
                                                </Text>
                                                <Text
                                                    className={`text-sm cursor-pointer hover:text-blue-500 ${isCommented ? "text-green-500!" : "text-gray-500!"
                                                        }`}
                                                    onClick={() =>
                                                        handleComment(post._id)
                                                    }
                                                >
                                                    {post.comments?.count || 0} <CommentOutlined />
                                                </Text>
                                            </div>
                                            <div className="flex flex-col  items-end gap-2">

                                                <Button
                                                    type="text"
                                                    icon={<EllipsisOutlined />}
                                                    onClick={() => {
                                                        setSelectedBlogData(post)
                                                        setBlogOpen(true)
                                                    }}
                                                />

                                                <Text className="text-gray-500 text-sm">
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </Text>

                                            </div>

                                        </div>




                                    </div>
                                }


                            />
                        </Card>
                    )
                })}


            </div>
            <CommentModal
                open={open}
                setOpen={setOpen}
                blogId={selectedBlog}
            />
            <BlogModal
                open={blogOpen}
                userId={user}
                setOpen={setBlogOpen}
                blog={selectedBlogData}
            />
        </>
    )
}

export default Blog
