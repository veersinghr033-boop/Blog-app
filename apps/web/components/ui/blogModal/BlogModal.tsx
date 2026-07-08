"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import api from "@/utills/axios";
import dynamic from "next/dynamic";

const CommentList = dynamic(
    () => import("./CommentList"),
    {
        ssr: false,
    }
);

const AddCommentForm = dynamic(
    () => import("./AddCommentForm"),
    {
        ssr: false,
    }
);
import BlogHeader from "./BlogHeader";
import BlogActions from "./BlogActions";

import ReportModal from "../Report";


interface ReadBlogProps {
    blog: any;
}

function ReadBlog({ blog }: ReadBlogProps) {
    const router = useRouter();
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const [openReport, setOpenReport] = useState(false);
    const [commentAdded, setCommentAdded] = useState(false);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        useInfiniteQuery({
            queryKey: ["comments", blog?._id],
            queryFn: async ({ pageParam }) => {
                const before = pageParam ? `?before=${pageParam}` : "";

                const res = await api.get(`/comments/${blog._id}${before}`);

                return res.data;
            },
            initialPageParam: null,
            getNextPageParam: (lastPage: any) =>
                lastPage.hasMore ? lastPage.nextCursor : undefined,
            enabled: !!blog._id && commentAdded
        });
    const commentOpen = async () => {
        const newState = !commentAdded;

        setCommentAdded(newState);

        if (newState) {
            await refetch();
        }
    };

    const comments = data?.pages.flatMap((page: any) => page.comments) ?? [];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];

                if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1 },
        );

        const current = loadMoreRef.current;

        if (current) {
            observer.observe(current);
        }

        return () => {
            if (current) {
                observer.unobserve(current);
            }
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    if (!blog) return null;
    return (
        <div className="bg-white rounded shadow-xl border border-gray-200 p-6 max-w-full mx-auto overflow-y-auto" style={{ maxHeight: "90vh" }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-semibold">Blog Details</h3>

                    {blog.title && <div className="text-gray-600 text-6xl">{blog.title}</div>}
                </div>

                <button className="text-gray-600 px-2 py-1" onClick={() => router.back()} aria-label="close">✕</button>
            </div>

            <div className="flex flex-col gap-4">
                <BlogHeader blog={blog} />

                <BlogActions
                    blog={blog}
                    onReport={() => setOpenReport(true)}
                    onOpen={commentOpen}
                />

                <div className="border-t border-t-gray-200 pt-5">
                    {commentAdded && (
                        <>
                            <title >Comments ({blog.comments?.count})</title>
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
                    )}
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
