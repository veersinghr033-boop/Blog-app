"use client";

import {
    Button,
   
    Popconfirm,
    message,
} from "antd";

import { useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useRouter } from "next/navigation";
import { Virtuoso } from "react-virtuoso";
import { Trash2, UserRound, TriangleAlert, User } from "lucide-react";


interface ReportCardProps {
    data: any[];
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
}

function ReportCard({ data, hasNextPage, isFetchingNextPage, fetchNextPage }: ReportCardProps) {
    const [selectedBlogData, setSelectedBlogData] = useState<any>(null)
    const router = useRouter();
    const userRole = useAppSelector((state) => state.auth.user?.role)


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
            queryClient.invalidateQueries({
                queryKey: ["reportUser", selectedBlogData?._id],
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
    const getTextFromLexical = (content: any): string => {
        if (!content?.root?.children) return "";

        const extract = (nodes: any[]): string => {
            return nodes
                .map((node) => {
                    if (node.text) return node.text;

                    if (node.children) {
                        return extract(node.children);
                    }

                    return "";
                })
                .join(" ");
        };

        return extract(content.root.children);
    };
   
    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-0">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <div className=" flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="mb-1! text-lg! md:text-2xl! font-semibold text-gray-800!">
                            Reports Management
                        </h2>

                        <p className="mb-0! text-gray-500">
                            Manage all reported blogs and review user complaints.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
                        <TriangleAlert size={20} className="text-red-500 text-xl" />

                        <div>
                            <p className="block text-gray-500 text-base">
                                Total Reports
                            </p>

                            <p  className="text-lg text-red-500">
                                {data?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {data?.length === 0 ? (
                <div className="flex max-h-[60vh] items-center justify-center rounded-3xl bg-white shadow-sm">

                    <span className="text-gray-500">
                        No reports found
                    </span>

                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <Virtuoso
                        style={{ height: "71vh", borderRadius:"10px"}}
                        data={data}
                        endReached={() => {
                            if (hasNextPage && !isFetchingNextPage) {
                                fetchNextPage?.();
                            }
                        }}
                        components={{
                            Item: ({ children, ...props }) => (
                                <div {...props} className="pb-6">
                                    {children}
                                </div>
                            ),
                        }}
                        itemContent={(_, report) => {
                            // const showReadMore = report.blogDetails?.content?.length > 150;
                            const textContent = getTextFromLexical(report.blogDetails?.content);
                            const showReadMore = textContent.length > 150;
                            return (
                                <div
                                    key={report._id}
                                    className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow p-5"
                                >
                                    <div className="mb-5 flex items-start justify-between">
                                        <h2
                                            
                                            className="rounded-lg border-0 px-4 py-1 text-sm font-medium bg-red-100 text-red-600"
                                        >
                                            Reported
                                        </h2>

                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 transition-all duration-300 group-hover:bg-red-100">
                                            <TriangleAlert size={20} className="text-lg text-red-500" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between gap-6">
                                        <div className="mb-5">
                                            <p className="text-xs! uppercase tracking-wide text-gray-400">
                                                Blog Title
                                            </p>

                                            <h2
                                                className="mt-2 mb-0 line-clamp-2 text-2xl text-gray-800"
                                            >
                                                {report.blogDetails?.title || "No Title"}
                                            </h2>
                                        </div>


                                        <div className="mb-5 ">



                                            <p className="text-xs! uppercase tracking-wide text-gray-400">
                                                Report Reason
                                            </p>


                                            <h2
                                                className="mt-2 mb-0 line-clamp-2 text-2xl text-gray-800"
                                            >
                                                {report.reason || "No reason provided"}
                                            </h2>
                                        </div>

                                    </div>
                                    <div className="bg-gray-100 rounded-lg p-4 mb-6">

                                        <p className="line-clamp-3">
                                            {textContent.slice(0, 400)}
                                        </p>

                                        {showReadMore && (
                                            <span
                                                className="text-blue-500 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedBlogData(report.blogDetails);
                                                    router.push(
                                                        `/${userRole}/blogs/${report.blogDetails._id}`
                                                    );

                                                }}                                        >
                                                Read more
                                            </span>
                                        )}


                                    </div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <UserRound size={15}/>

                                            <span>
                                                {report.userDetails?.userName || "Unknown User"}
                                            </span>
                                        </div>

                                        <span>
                                            {new Date(report.createdAt).toLocaleString()}
                                        </span>
                                    </div>


                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <p className="text-xs text-gray-400">
                                            #{report._id}
                                        </p>

                                        <Popconfirm
                                            title="Delete Report"
                                            description="Are you sure you want to delete this report?"
                                            okText="Yes"
                                            cancelText="No"
                                            onConfirm={() => handleDelete(report._id)}
                                        >
                                            <Button
                                                danger
                                                icon={<Trash2 size={15} />}
                                                className="rounded-xl"
                                            >
                                                Delete
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </div>)

                        }} />
                    {isFetchingNextPage && (
                        <div className="text-center py-4">
                            Loading more reports...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ReportCard;