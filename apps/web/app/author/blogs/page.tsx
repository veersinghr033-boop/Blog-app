"use client"

import { Layout } from "antd"
import Blog from "@/components/ui/blog";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { fetchBlogById } from "@/lib/store/features/blogThunk";
import { useEffect, useMemo } from "react";
import api from "@/utills/axios";
import { useQuery } from "@tanstack/react-query";

function Blogs() {
    const userId = useAppSelector((state) => state.auth.user?.id);

    // const blog = useAppSelector(
    //     (state) => state.blog.currentBlog
    // ) || [];

    const dispatch = useAppDispatch();

    // useEffect(() => {
    //     if (userId) {
    //         dispatch(fetchBlogById(userId) as any);
    //     }
    // }, [dispatch, userId]);

    const { data: blog = [], isLoading } = useQuery({
        queryKey: ["blogData", userId],
        enabled: !!userId,
        queryFn: async () => {
            const response = await api.get(`/blogs/${userId}`);
            return response.data.blog || [];
        },
    });

    const totalEngagement = useMemo(() => {
        return blog.reduce((total: number, b: any) => {
            return total + (b.likes?.count || 0) + (b.comments?.count || 0);
        }, 0);
    }, [blog]);

    const cardData = [
        {
            title: "Total Blogs",
            value: blog.length,
            desc: "Published",
            bg: "bg-blue-100",
        },
        {
            title: "Total Views",
            value: 1200,
            desc: "All time",
            bg: "bg-green-100",
        },
        {
            title: "Engagement",
            value: totalEngagement,
            desc: "Likes and comments",
            bg: "bg-yellow-100",
        },
    ];

    return (
        <Layout className="min-h-screen bg-white" >
            <header className="flex flex-col w-full gap-4 border-b border-gray-200 ">
                <div>
                    <h2 className="text-2xl">My Blogs</h2>
                    <p className="text-gray-500">
                        Manage your blogs and content
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cardData.map((card, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg flex-1 ${card.bg}`}
                        >
                            <h3 className="text-lg font-semibold">
                                {card.title}
                            </h3>

                            <p className="text-2xl font-bold">
                                {card.value}
                            </p>

                            <p className="text-gray-500">
                                {card.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </header>

            <Blog data={blog} />
        </Layout>
    );
}

export default Blogs;