"use client"
import { Card, Tag, Typography, message, Button } from "antd"
import { EllipsisOutlined } from "@ant-design/icons"
import api from "@/utills/axios"
import { useState } from "react"
import { useAppSelector } from "@/lib/store/hooks"
import CommentModal from "@/components/ui/comment"
import BlogModal from "@/components/ui/blogModal"
import { useMutation } from "@tanstack/react-query"


const { Title, Paragraph, Text } = Typography

function Blog({ data}: { data: any[]}) {
    const [open, setOpen] = useState(false)
    const [blogOpen, setBlogOpen] = useState(false)
    const [expandedBlogs, setExpandedBlogs] = useState<Record<string, boolean>>({})
    const [selectedBlogData, setSelectedBlogData] = useState<any>(null)
    const [selectedBlog, setSelectedBlog] = useState("")
    const user = useAppSelector((state) => state.auth.user?.id)
 const LikeMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const res = await api.post(`/likes/${blogId}`, {
                userId: user,
            })
            return res.data
        },
        onSuccess: () => {
            message.success("Blog liked")
        },
        onError: (error) => {
            console.error("Error liking blog:", error)
            message.error("Failed to like blog")
        },
    })
    const handleLike = async (blogId: string) => {
        LikeMutation.mutate(blogId)

    }
    const handleComment = (blogId: string) => {

        setSelectedBlog(blogId)

        setOpen(true)
    }

    // console.log(data)
    return (
        <>
            <div className="flex flex-col gap-5  pt-5 ">

                {data.map((post, index) => (
                    <Card
                        key={post._id || index}
                        hoverable

                        className=" rounded-2xl border border-gray-200 shadow-sm overflow-hidden"

                    >
                        <Card.Meta
                            title={
                                <div className="flex justify-between items-center">
                                    <Title level={4} >
                                        {post.title}
                                    </Title>

                                    
                                </div>
                            }
                            description={
                                <div className="flex justify-between items-start gap-4 mt-3">
                                    <div className=" max-w-3/4 flex flex-col gap-3">
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

                                        <div className="flex items-center gap-4">

                                            <div className="flex items-center gap-2">

                                                <div className="bg-gray-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs uppercase">
                                                    {post.author?.name?.charAt(0)}
                                                </div>

                                                <Text>
                                                    {post.author?.name}
                                                </Text>

                                                <Text
                                                    className="text-sm text-gray-500 cursor-pointer"
                                                    onClick={() => handleLike(post._id)}
                                                >
                                                    {post.likes?.count || 0} likes
                                                </Text>
                                                <Text
                                                    className="text-sm text-gray-500 cursor-pointer hover:text-blue-500"
                                                    onClick={() =>
                                                        handleComment(post._id)
                                                    }
                                                >
                                                    {post.comments?.count || 0} Comments
                                                </Text>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">

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
                            }


                        />
                    </Card>
                ))}


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
