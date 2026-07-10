"use client";
import dynamic from "next/dynamic";
const Blog = dynamic(
    () => import("@/components/ui/blog/Blog"),
    {
        loading: () => <div>Loading...</div>,
    }
); import { useAppSelector } from "@/lib/store/hooks";
import api from "@/utills/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react"

function Blogs() {
    const userId = useAppSelector((state) => state.auth.user?.id);
    const role = useAppSelector((state) => state.auth.user?.role);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["blogData", userId],
        queryFn: async ({ pageParam }) => {
            const before = pageParam
                ? `?before=${pageParam}`
                : "";

            const res = await api.get(
                `/blogs/${userId}${before}`
            );

            return res.data;
        },

        initialPageParam: null,

        getNextPageParam: (lastPage) =>
            lastPage.hasMore
                ? lastPage.nextCursor
                : undefined,
    });
  
    const blog = useMemo(() => {
        return data?.pages.flatMap(page => page.blog) ?? [];
    }, [data]);
    const stats = data?.pages?.[0]?.stats;

    const cardData = [
        {
            title: "Total Blogs",
            value: stats?.totalBlogs ?? 0,
            desc: "Published",
            bg: "bg-blue-100",
        },
        {
            title: "Total Views",
            value: stats?.totalViews ?? 0,
            desc: "All time",
            bg: "bg-green-100",
        },
        {
            title: "Engagement",
            value: (stats?.totalLikes ?? 0) + (stats?.totalComments ?? 0),
            desc: "Likes and comments",
            bg: "bg-yellow-100",
        },
    ];

    return (
        <div className="min-h-screen " >
            <header className="flex flex-col w-full gap-4 border-b border-gray-200 ">
                <div>
                    <h2 className="text-2xl">My Blogs</h2>
                    <p className="text-gray-500">
                        Manage your blogs and content
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
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
            <div className="h-[67vh] mt-3 overflow-auto ">

                <Blog data={blog} hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage} userId={userId} role={role}
                />
            </div>
        </div>
    );
}

export default Blogs;