// "use client";

import { useState ,useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import api from "@/utills/axios";
import dynamic from "next/dynamic";


const CommentList = dynamic(
    () => import("./CommentList"),
    {
        loading: () => <div>Loading comments...</div>,
    }
);

const AddCommentForm = dynamic(
    () => import("./AddCommentForm"),
    {
        loading: () => <div>Loading form...</div>,
    }
);

const ReportModal = dynamic(
    () => import("../Report")
);

import BlogHeader from "./BlogHeader";
import BlogActions from "./BlogActions";

interface ReadBlogProps {
    blog: any;
}

function ReadBlog({ blog }: ReadBlogProps) {
    const router = useRouter();
    const [openReport, setOpenReport] = useState(false);
    const [commentAdded, setCommentAdded] = useState(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["comments", blog?._id],
        queryFn: async ({ pageParam }) => {
            const before = pageParam ? `?before=${pageParam}` : "";

            const res = await api.get(
                `/comments/${blog._id}${before}`
            );

            return res.data;
        },
        initialPageParam: null,
        getNextPageParam: (lastPage: any) =>
            lastPage.hasMore
                ? lastPage.nextCursor
                : undefined,
        enabled: !!blog?._id && commentAdded,
    });

    const commentOpen = async () => {
        const newState = !commentAdded;

        setCommentAdded(newState);

        if (newState) {
            await refetch();
        }
    };

    const comments = useMemo(
        () => data?.pages.flatMap(page => page.comments) ?? [],
        [data]
    );
    if (!blog) return null;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded shadow-xl border border-gray-200 dark:border-zinc-800 p-6 max-w-full mx-auto overflow-y-auto max-h-[91vh]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                        Blog Details
                    </h3>

                    {blog.title && (
                        <div className="text-gray-700 dark:text-gray-300 text-4xl">
                            {blog.title}
                        </div>
                    )}
                </div>

                <button
                    className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white px-2 py-1 cursor-pointer"
                    onClick={() => router.back()}
                    aria-label="close"
                >
                    <X />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <BlogHeader blog={blog} />

                <BlogActions
                    blog={blog}
                    onReport={() => setOpenReport(true)}
                    onOpen={commentOpen}
                />

                <div className="border-t border-gray-200 dark:border-zinc-800 pt-5">
                    {commentAdded ? (
                        <>
                            <h4 className="font-semibold mb-3 text-black dark:text-white">
                                Comments ({blog.comments?.count || 0})
                            </h4>

                            <div className="max-h-72 overflow-y-auto flex flex-col gap-3 mb-4">
                                <CommentList
                                    comments={comments}
                                    blogId={blog._id}
                                    hasNextPage={hasNextPage}
                                    isFetchingNextPage={isFetchingNextPage}
                                    fetchNextPage={fetchNextPage}
                                />
                            </div>

                            <AddCommentForm blogId={blog._id} />
                        </>
                    ) : null}
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