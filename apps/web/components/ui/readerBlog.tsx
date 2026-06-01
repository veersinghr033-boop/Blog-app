"use client"

import { Typography, Card, message } from "antd"
import { useEffect, useState } from "react"
import api from "@/utills/axios"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import CommentModal from "@/components/ui/comment"
import BlogModal from "@/components/ui/blogModal"
import { SaveOutlined, LikeOutlined ,CommentOutlined } from "@ant-design/icons"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import Blog from "./blog"

const { Title, Paragraph, Text } = Typography

function ReaderBlog({ data }: { data?: any[] }) {
    const [open, setOpen] = useState(false)
    const [blogOpen, setBlogOpen] = useState(false)

    const [expandedBlogs, setExpandedBlogs] = useState<
        Record<string, boolean>
    >({})
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch()
    const [selectedBlogData, setSelectedBlogData] = useState<any>(null)
    const [selectedBlog, setSelectedBlog] = useState("")

    const user = useAppSelector((state) => state.auth.user?.id)

    const { data: savedBlogs = [], isError, error } = useQuery({
        queryKey: ["save"],
        queryFn: async () => {
            const response = await api.get("/blogsave/get");

            // console.log(response.data);

            return response.data.blogs
        },
    })

    const LikeMutation = useMutation({
        mutationFn: async (blogId: string) => {
            const res = await api.post(`/likes/${blogId}`, {
                userId: user,
            })
            return res.data
        },
        onSuccess: () => {
            message.success("Blog liked")
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            })
            queryClient.invalidateQueries({
                queryKey: ["blogData", user],
            })
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

        const alreadySaved = savedBlogs.some(
            (save: any) => save.blogDetails?._id === blogId
        )

        SaveMutation.mutate(blogId, {
            onSuccess: () => {

                if (alreadySaved) {
                    message.warning("Blog unsaved")
                } else {
                    message.success("Blog saved")
                }

                queryClient.invalidateQueries({
                    queryKey: ["saved"],
                })

                queryClient.invalidateQueries({
                    queryKey: ["save"],
                })
            },
        })
    }
    // console.log("save" ,savedBlogs)

    const savedIds =
        savedBlogs?.flatMap(
            (save: any) => save.blogDetails?._id || []
        ) || []


    return (
        <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {data?.map((blog) => {
                    const isLiked =
                        blog.likes?.users?.includes(user)

                    const isCommented =
                        blog.comments?.details?.some(
                            (comment: any) =>
                                comment.user === user
                        )
                    return (
                        <Card
                            key={blog._id}
                            hoverable
                            className="rounded-2xl border border-gray-200 shadow-sm h-full!"
                            bodyStyle={{ height: "100%" }}
                        >
                            <div className="flex flex-col h-full min-h-60">

                                <div>
                                    <Title
                                        level={4}
                                        className="mb-3! line-clamp-2 min-h-10"
                                    >
                                        {blog.title}
                                    </Title>

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
                                        className="text-gray-600 "
                                    >
                                        {blog.content}
                                    </Paragraph>

                                    {expandedBlogs[blog._id] && (
                                        <Text
                                            className="text-blue-500! hover:text-blue-700! cursor-pointer"
                                            onClick={() => handleReadMore(blog)}
                                        >
                                            Read more
                                        </Text>
                                    )}
                                </div>

                                <div className="flex justify-between items-end mt-auto pt-6">

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs uppercase">
                                                {blog.author?.userName?.charAt(0)}
                                            </div>

                                            <Text strong>
                                                {blog.author?.userName}
                                            </Text>
                                        </div>

                                        <div className="flex gap-4 items-center">
                                            <Text
                                                className={`text-sm cursor-pointer hover:text-blue-500 ${isLiked ? "text-blue-500!" : "text-gray-500!"
                                                    }`}
                                                onClick={() => handleLike(blog._id)}
                                                title="Like"
                                            >
                                                {blog.likes?.count || 0} <LikeOutlined />
                                            </Text>
                                            <Text
                                                className={`text-sm cursor-pointer hover:text-blue-500 ${isCommented ? "text-green-500!" : "text-gray-500!"
                                                    }`}
                                                onClick={() =>
                                                    handleComment(blog._id)
                                                }
                                                title="Comment"
                                            >
                                                {blog.comments?.count || 0} <CommentOutlined />
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
                            </div>
                        </Card>
                    )
                })}
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