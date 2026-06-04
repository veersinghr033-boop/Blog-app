"use client";

import { Typography, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import api from "@/utills/axios";

import BlogHeader from "./BlogHeader";
import BlogActions from "./BlogActions";
import AddCommentForm from "./AddCommentForm";
import CommentList from "./CommentList";
import ReportModal from "../Repot";

const { Title, Text } = Typography;

interface ReadBlogProps {
    blog: any;
}

function ReadBlog({ blog }: ReadBlogProps) {
    const router = useRouter();

    const [openReport, setOpenReport] =
        useState(false);
    const [commentAdded, setCommentAdded] =
        useState(false);

    const { data: comments = [] } =
        useQuery({
            queryKey: [
                "comments",
                blog?._id,
            ],

            enabled: !!blog?._id,

            queryFn: async () => {
                const res = await api.get(
                    `/comments/${blog._id}`
                );

                return res.data.comments;
            },
        });

    const commentOpen = () =>{
        setCommentAdded((prev) => !prev);

    }

    if (!blog) return null;
    
    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 max-w-5xl mx-auto ">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <Title level={3}>
                        Blog Details
                    </Title>

                    {blog.title && (
                        <Text type="secondary">
                            {blog.title}
                        </Text>
                    )}
                </div>

                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() =>
                        router.back()
                    }
                />
            </div>

            <div className="flex flex-col gap-4">
                <BlogHeader blog={blog} />

                <BlogActions
                    blog={blog}
                    onReport={() =>
                        setOpenReport(true)
                    }
                    onOpen={commentOpen}
                />

                <div className="border-t border-t-gray-200 pt-5">

                   
                    {commentAdded && (
                        <>
                            <Title level={4}>
                                Comments (
                                {comments.length})

                            </Title>
                            <div className="max-h-72 overflow-y-auto flex flex-col gap-3 mb-4">
                                <CommentList
                                    comments={comments}
                                    blogId={blog._id}
                                />
                            </div>

                            <AddCommentForm
                                blogId={blog._id}
                            />
                        </>
                    )}




                </div>
            </div>

            <ReportModal
                blogId={blog._id}
                open={openReport}
                setOpen={setOpenReport}
            />
        </div>
    );
}

export default ReadBlog;