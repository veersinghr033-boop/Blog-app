"use client";

import { useMemo } from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { VirtuosoGrid } from "react-virtuoso";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import dynamic from "next/dynamic";
const ReaderBlogCard = dynamic(
    () => import("./ReaderBlogCard")
); import { toast } from "sonner";
interface BlogProps {
    type: "all" | "saved" | "trending";
}

function ReaderBlog({ type }: BlogProps) {
    const userId = useAppSelector((state) => state.auth.user?._id);
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: [type],

        queryFn: async ({ pageParam }) => {
            const before = pageParam
                ? `?before=${encodeURIComponent(String(pageParam))}`
                : "";

            const response = await api.get(
                type === "saved"
                    ? `/blogsave/get${before}`
                    : type === "trending"
                        ? `/blogs/trending${before}`
                        : `/blogs/all${before}`
            );

            return response.data;
        },

        initialPageParam: null,

        getNextPageParam: (lastPage) =>
            lastPage?.hasMore ? lastPage.nextCursor : undefined,

        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
    });

    const { data: savedBlogs = [] } = useQuery({
        queryKey: ["save", userId],

        queryFn: async () => {
            const response = await api.get("/blogsave/get");
            return response.data.blogs;
        },

        enabled: userId !== null,
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
    });

    const blogs = useMemo(() => {
        return (
            data?.pages.flatMap((page) => {
                const items = Array.isArray(page?.blogs)
                    ? page.blogs
                    : [];

                return type === "saved"
                    ? items.map((item: any) => item.blogDetails)
                    : items;
            }) ?? []
        );
    }, [data, type]);

    const savedIds = useMemo(
        () => new Set(savedBlogs.map((b: any) => b.blogDetails?._id)),
        [savedBlogs]
    );

    const likeMutation = useMutation({
        mutationFn: async ({
            blogId,
            userId,
        }: {
            blogId: string;
            userId: string;
        }) => {
            return api.post(`/likes/${blogId}`, {
                userId,
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["all"],
            });

            queryClient.invalidateQueries({
                queryKey: ["saved"],
            });
            queryClient.invalidateQueries({
                queryKey: ["trending"],
            });
        },
    });

    const saveMutation = useMutation({
        mutationFn: async ({
            blogId,
            isSaved,
        }: {
            blogId: string;
            isSaved: boolean;
        }) => {
            await api.post("/blogsave", {
                blogId,
            });

            return { isSaved };
        },

        onSuccess: ({ isSaved }) => {
            if (isSaved) {
                toast.warning("Blog unsaved");
            } else {
                toast.success("Blog saved");
            }

            queryClient.invalidateQueries({
                queryKey: ["all"],
            });

            queryClient.invalidateQueries({
                queryKey: ["saved"],
            });

            queryClient.invalidateQueries({
                queryKey: ["save"],
            });
        },
    });

    const viewMutation = useMutation({
        mutationFn: async (blogId: string) => {
            return api.post(`/views/${blogId}`);
        },
    });
    // console.log(blogs)
    return (
        <div>
            <VirtuosoGrid
                style={{
                    height: "calc(100vh - 150px)"
                }}
                totalCount={blogs.length}
                endReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                itemContent={(index) => {
                    const blog = blogs[index];
                    return (
                        <ReaderBlogCard
                            index={index}
                            post={blog}
                            isSaved={savedIds.has(blog._id)}
                            userId={userId!}
                            onLike={(blogId) =>
                                likeMutation.mutate({
                                    blogId,
                                    userId: userId!,
                                })
                            }
                            onSave={(blogId, isSaved) =>
                                saveMutation.mutate({
                                    blogId,
                                    isSaved,
                                })
                            }
                            onView={(blogId) =>
                                viewMutation.mutate(blogId)
                            }
                        />
                    );
                }}
            />

            {isFetchingNextPage && (
                <div className="py-4 text-center text-sm text-gray-500">
                    Loading more blogs...
                </div>
            )}
        </div>
    );
}

export default ReaderBlog;