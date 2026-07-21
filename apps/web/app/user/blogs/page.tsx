"use client";
import dynamic from "next/dynamic";
const Blog = dynamic(
    () => import("@/components/ui/blog/Blog"),
    {
        loading: () => <div>Loading...</div>,
    }
); import { useAppSelector } from "@/lib/store/hooks";
import api from "@/utills/axios";
import { useQuery } from "@tanstack/react-query";

function Blogs() {
    const userId = useAppSelector((state) => state.auth.user?._id);
    const role = useAppSelector((state) => state.auth.user?.role);

    const { data: stats } = useQuery({
        queryKey: ["userBlogsStats", userId],
        queryFn: async () => {
            const res = await api.get(`/blogs/user-blogs?userId=${userId}`);
            return res.data.stats
                },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
    const cardData = [
        {
            title: "Total Blogs",
            value: stats?.totalBlogs ?? 0,
            desc: "Published",
            bg: "bg-blue-100 dark:bg-blue-950",
        },
        {
            title: "Total Views",
            value: stats?.totalViews ?? 0,
            desc: "All time",
            bg: "bg-green-100 dark:bg-green-950",
        },
        {
            title: "Engagement",
            value: (stats?.totalLikes ?? 0) + (stats?.totalComments ?? 0),
            desc: "Likes and comments",
            bg: "bg-yellow-100 dark:bg-yellow-950",
        },
    ];

    return (
        <div className="min-h-screen">
            <header className="flex flex-col w-full gap-4 border-b border-gray-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-2xl text-black dark:text-white">
                        My Blogs
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your blogs and content
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cardData.map((card, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border border-gray-200 dark:border-zinc-800 ${card.bg}`}
                        >
                            <h3 className="text-lg font-semibold text-black dark:text-white">
                                {card.title}
                            </h3>

                            <p className="text-2xl font-bold text-black dark:text-white">
                                {card.value}
                            </p>

                            <p className="text-gray-500 dark:text-gray-400">
                                {card.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </header>

            <div className="h-[72vh] mt-3 overflow-auto">
                <Blog
                    type="user"
                    userId={userId}
                    role={role}
                />
            </div>
        </div>
    );
}

export default Blogs;