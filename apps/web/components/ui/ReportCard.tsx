"use client";

import {
    Button,
    Card,
    Layout,
    Tag,
    Typography,
    Popconfirm,
    message,
    Empty,
} from "antd";
import BlogModal from "@/components/ui/blogModal";
import {
    DeleteOutlined,
    UserOutlined,
    CalendarOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";

const { Title, Paragraph, Text } = Typography;

interface ReportCardProps {
    data: any[];
}

function ReportCard({ data }: ReportCardProps) {
    const [blogOpen, setBlogOpen] = useState(false)
    const [selectedBlogData, setSelectedBlogData] = useState<any>(null)
    const [expandedBlogs, setExpandedBlogs] = useState<Record<string, boolean>>({})

    const user = useAppSelector((state) => state.auth.user?.id)


    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (reportId: string) => {
            await api.delete(`/reports/${reportId}`);
        },

        onSuccess: () => {
            message.success("Report deleted");

            queryClient.invalidateQueries({
                queryKey: ["reports"],
            });
            queryClient.invalidateQueries({
                queryKey: ["report"],
            });
        },

        onError: (error) => {
            console.error("Error deleting report:", error);
            message.error("Failed to delete report");
        },
    });



    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    return (
        <Layout className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-3">
            <div className="mb-10 rounded-3xl bg-white p-6 shadow-sm border border-gray-200">
                <div className=" flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <Title  className="mb-1! text-lg! md:text-2xl! font-bold text-gray-800!">
                            Reports Management
                        </Title>

                        <Paragraph className="mb-0! text-gray-500">
                            Manage all reported blogs and review user complaints.
                        </Paragraph>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
                        <WarningOutlined className="text-red-500 text-xl" />

                        <div>
                            <Text className="block text-gray-500 text-xs">
                                Total Reports
                            </Text>

                            <Text strong className="text-lg text-red-500">
                                {data?.length || 0}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>

            {data?.length === 0 ? (
                <div className="flex h-[60vh] items-center justify-center rounded-3xl bg-white shadow-sm">
                    <Empty
                        description={
                            <span className="text-gray-500">
                                No reports found
                            </span>
                        }
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {data?.map((report: any) => (
                        <Card
                            key={report._id}
                            hoverable
                            className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            bodyStyle={{ padding: "22px" }}
                        >
                            <div className="mb-5 flex items-start justify-between">
                                <Tag
                                    color="red"
                                    className="rounded-full border-0 px-4 py-1 text-sm font-medium"
                                >
                                    Reported
                                </Tag>

                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 transition-all duration-300 group-hover:bg-red-100">
                                    <WarningOutlined className="text-lg text-red-500" />
                                </div>
                            </div>

                            <div className="flex justify-between gap-6">
                                <div className="mb-5">
                                    <Text className="text-xs! uppercase tracking-wide text-gray-400">
                                        Blog Title
                                    </Text>

                                    <Title
                                        level={4}
                                        className="mt-2! mb-0! line-clamp-2 text-gray-800!"
                                    >
                                        {report.blogDetails?.title || "No Title"}
                                    </Title>
                                </div>


                                <div className="mb-5 ">



                                    <Text className="text-xs! uppercase tracking-wide text-gray-400">
                                        Report Reason
                                    </Text>


                                    <Title
                                        level={4}
                                        className="mt-2! mb-0! line-clamp-2 text-gray-800!"
                                    >
                                        {report.reason || "No reason provided"}
                                    </Title>
                                </div>

                            </div>
                            <div className="bg-gray-100 rounded-lg p-4 mb-6">
                                <Paragraph
                                    ellipsis={{
                                        rows: 3,
                                        onEllipsis: (ellipsis) => {
                                            setExpandedBlogs((prev) => ({
                                                ...prev,
                                                [report._id]: ellipsis,
                                            }))
                                        },
                                    }}
                                >
                                    {report.blogDetails?.content}
                                </Paragraph>

                                {expandedBlogs[report._id] && (
                                    <Text
                                        className="text-blue-500! hover:text-blue-700! cursor-pointer"
                                        onClick={() => {
                                            setSelectedBlogData(report.blogDetails)
                                            setBlogOpen(true)
                                        }}
                                    >
                                        Read more
                                    </Text>
                                )}


                            </div>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <UserOutlined />

                                    <span>
                                        {report.userDetails?.userName || "Unknown User"}
                                    </span>
                                </div>

                                <span>
                                    {new Date(report.createdAt).toLocaleString()}
                                </span>
                            </div>


                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <Text className="text-xs text-gray-400">
                                    #{report._id}
                                </Text>

                                <Popconfirm
                                    title="Delete Report"
                                    description="Are you sure you want to delete this report?"
                                    okText="Yes"
                                    cancelText="No"
                                    onConfirm={() => handleDelete(report._id)}
                                >
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        className="rounded-xl"
                                    >
                                        Delete
                                    </Button>
                                </Popconfirm>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            <BlogModal
                open={blogOpen}
                userId={user}
                setOpen={setBlogOpen}
                blog={selectedBlogData}
            />
        </Layout>
    );
}

export default ReportCard;