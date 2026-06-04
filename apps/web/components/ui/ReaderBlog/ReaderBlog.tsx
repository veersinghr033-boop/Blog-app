"use client";

import { useState } from "react";
import { message } from "antd";
import {
    useMutation,
    useQueryClient,
    useQuery,
} from "@tanstack/react-query";

import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";

import ReadBlog from "../blogModal/BlogModal";
import ReaderBlogCard from "./ReaderBlogCard";
import { useRouter } from "next/navigation";

function ReaderBlog({ data = [] }: { data?: any[] }) {
    const user = useAppSelector(
        (state) => state.auth.user?.id
    );

    const queryClient = useQueryClient();
    const router = useRouter();
    const [blogOpen, setBlogOpen] = useState(false);
    const [selectedBlogData, setSelectedBlogData] =
        useState<any>(null);
    const [expandedBlogs, setExpandedBlogs] = useState<
        Record<string, boolean>
    >({});


    const viewMutation = useMutation({
        mutationFn: async (blogId: string) => {
            console.log("blogId", blogId)

            const response = await api.post(`/views/${blogId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });
            queryClient.invalidateQueries({
                queryKey: ["blogData", user],
            });
        },
        onError: (error: any) => {
            const status = error?.response?.status;

            if (status === 400) {
                message.warning("Already viewed");
            } else if (status === 404) {
                message.error("Blog not found");
            } else if (status === 401) {
                message.error("Login required");
            } else {
                message.error(
                    error?.response?.data?.message ||
                    "Something went wrong"
                );
            }
        }
    });

    const openBlogModal = (blog: any) => {
        console.log("BlogData", blog)
        router.push(
            `/reader/blogs/${blog._id}`
        );
        viewMutation.mutate(blog._id)
    };





    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((blog) => (
                    <ReaderBlogCard
                        key={blog._id}
                        post={blog}
                        expanded={expandedBlogs[blog._id]}

                        onExpand={(id, value) =>
                            setExpandedBlogs((prev) => ({
                                ...prev,
                                [id]: value,
                            }))
                        }

                        onOpen={openBlogModal}
                    />
                ))}
            </div>

            {/* <ReadBlog
                open={blogOpen}
                setOpen={setBlogOpen}
                blog={selectedBlogData}
                userId={user}
            /> */}
        </>
    );
}

export default ReaderBlog;