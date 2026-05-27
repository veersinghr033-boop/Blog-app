"use client"

import { Typography, Card, message } from "antd"
import { useEffect, useState } from "react"
import api from "@/utills/axios"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { getSavedBlogs } from "@/lib/store/features/saveThunk"
import CommentModal from "@/components/ui/comment"
import BlogModal from "@/components/ui/blogModal"
import { SaveOutlined } from "@ant-design/icons"
import { useMutation } from "@tanstack/react-query"

const { Title, Paragraph, Text } = Typography

function ReaderBlog({ data }: { data?: any[] }) {
    const [open, setOpen] = useState(false)
    const [blogOpen, setBlogOpen] = useState(false)

    const [expandedBlogs, setExpandedBlogs] = useState<
        Record<string, boolean>
    >({})
    const dispatch = useAppDispatch()
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

    const SaveMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const response = await api.post(`/blogsave`, {
                blogId,
            })
            return response.data
        },
        onSuccess: () => {
            message.success("Blog saved")
            dispatch(getSavedBlogs() as any)
        },
        onError: (error) => {
            console.error("Error saving blog:", error)
            message.error("Failed to save blog")
        },
    })


    const handleLike = async (blogId: string) => {
        LikeMutation.mutate(blogId)
    }

    const handleComment = (blogId: string) => {
        setSelectedBlog(blogId)
        setOpen(true)
    }

    const handleReadMore = (blog: any) => {
        setSelectedBlogData(blog)
        setBlogOpen(true)
    }
    const handleSave = async (blogId: string) => {
        SaveMutation.mutate(blogId)
    }
    const savedBlogs = useAppSelector(
        (state) => state.save.savedBlogs
    )
    const savedIds = savedBlogs?.flatMap(
        (save) => save.blogDetails?._id || []

    )


    return (
        <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.map((blog) => (
                    <Card
                        key={blog._id}
                        hoverable
                        className="rounded-2xl border border-gray-200 shadow-sm h-full "
                    >
                        <div className="flex justify-between items-start mb-4">
                            <Title
                                level={4}
                                className="!mb-0 line-clamp-2"
                            >
                                {blog.title}
                            </Title>
                        </div>

                        <Paragraph
                            ellipsis={{
                                rows: 3,
                                expandable: false,
                                onEllipsis: (ellipsis) => {
                                    setExpandedBlogs((prev) => ({
                                        ...prev,
                                        [blog._id]: ellipsis,
                                    }))
                                },
                            }}
                            className="text-gray-600"
                        >
                            {blog.content}
                        </Paragraph>

                        {expandedBlogs[blog._id] && (
                            <Text
                                className="!text-blue-500 hover:!text-blue-700 cursor-pointer"
                                onClick={() => handleReadMore(blog)}
                            >
                                Read more
                            </Text>
                        )}

                        <div className="flex justify-between items-end mt-5 bottom-0">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs uppercase">
                                        {blog.author?.name?.charAt(0)}
                                    </div>

                                    <Text strong>
                                        {blog.author?.name}
                                    </Text>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <Text
                                        className="text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
                                        onClick={() =>
                                            handleLike(blog._id)
                                        }
                                    >
                                        {blog.likes?.count || 0} Likes
                                    </Text>

                                    <Text
                                        className="text-sm text-gray-500 hover:text-blue-500 cursor-pointer"
                                        onClick={() =>
                                            handleComment(blog._id)
                                        }
                                    >
                                        {blog.comments?.count || 0} Comments
                                    </Text>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <Text className="text-gray-400 text-xs">
                                    {new Date(
                                        blog.createdAt
                                    ).toLocaleDateString()}
                                </Text>

                                <SaveOutlined
                                    className={`text-lg cursor-pointer transition-colors ${savedIds.includes(blog._id)
                                        ? "text-blue-500!"
                                        : "text-gray-400! hover:text-blue-500!"
                                        }`}
                                    onClick={() => handleSave(blog._id)}
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </section>

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

export default ReaderBlog