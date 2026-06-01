"use client";

import { Modal, Typography, Button, Popconfirm } from "antd";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import ReportModal from "./Repot";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";

const { Title, Paragraph, Text } = Typography;

interface BlogModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    blog: any;
    userId?: any;
}

function BlogModal({ open, setOpen, blog, userId }: BlogModalProps) {
    const [ openReport, setOpenReport ] = useState(false);
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
        const deleteMutation = useMutation({
        mutationFn: async (blogId: string) => {
                await api.delete(`/blogs/delete/${blogId}`);
           
        },
        onSuccess: () => {
           
            queryClient.invalidateQueries({
                queryKey: ["blogData", userId],
            });
            setOpen(false);
        },
        onError: (error) => {
            console.error("Error deleting blog:", error);
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate(blog._id);
    }

    return (
        <Modal
            title="Blog Details"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            width={700}
        >
            <div className="flex flex-col gap-4">
                <Title level={3}>{blog?.title}</Title>

                <Paragraph className="max-h-80 overflow-auto whitespace-pre-line">{blog?.content}</Paragraph>

                <div className="flex items-center gap-3">
                    <div className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs uppercase">
                        {blog?.author?.userName?.charAt(0)}
                    </div>

                    <Text>{blog?.author?.userName}</Text>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <Text className="text-gray-500">
                        {blog?.createdAt && new Date(blog.createdAt).toLocaleDateString()}
                    </Text>
                    {userId === blog?.author?.id ? (
                        <Popconfirm
                            title="Are you sure you want to delete this blog?"
                            onConfirm={handleDelete}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" danger>
                                Delete
                            </Button>
                        </Popconfirm>
                    ) :

                        <Button type="primary" danger
                            onClick={() => setOpenReport(true)}
                        >
                            Report
                        </Button>
                    }
                </div>
            </div>
            <ReportModal blogId={blog?._id}  open={openReport} setOpen={setOpenReport} />
        </Modal>

    );
}

export default BlogModal;
