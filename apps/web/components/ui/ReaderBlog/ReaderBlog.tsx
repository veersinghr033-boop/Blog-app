// "use client";

import { useMemo, useRef } from "react";
import {  useQuery } from "@tanstack/react-query";
import { VirtuosoGrid } from "react-virtuoso";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import ReaderBlogCard from "./ReaderBlogCard";

interface BlogProps {
    data: any[];
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
    initialSavedData?: any[];
}

function ReaderBlog({ data, hasNextPage = false, isFetchingNextPage = false, fetchNextPage, initialSavedData }: BlogProps) {
    const user = useAppSelector((state) => state.auth.user?.id);
   
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const { data: savedBlogs = [] } = useQuery({
        queryKey: ["save"],
        queryFn: async () => {
            const response = await api.get("/blogsave/get");
            return response.data.blogs;
        },
        initialData: initialSavedData,
        enabled: Boolean(user),
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
    });

    const savedIds = useMemo(
        () => new Set(savedBlogs.map((b: any) => b.blogDetails?._id)),
        [savedBlogs]
    );
   

    return (
        <div >
            <VirtuosoGrid
                style={{ height: "80vh" }}
                totalCount={data.length}
                endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage?.();
                    }
                }}
                listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                itemContent={(index) => {
                    const blog = data[index];

                    return (
                        <ReaderBlogCard
                            post={blog}
                            isSaved={savedIds.has(blog._id)}
                            userId={user}
                        />
                    );
                }}
            />

            <div ref={loadMoreRef} className="col-span-full h-4" />

            {isFetchingNextPage ? (
                <div className="col-span-full py-4 text-center text-sm text-gray-500">Loading more blogs...</div>
            ) : null}
        </div>
    );
}

export default ReaderBlog;