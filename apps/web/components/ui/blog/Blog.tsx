"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/utills/axios";
import BlogCard from "./BlogCard";

interface BlogProps {
  type: "admin" | "user";
  userId?: string;
  role?: string;
}

function Blog({ type, userId, role }: BlogProps) {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey:
      type === "admin"
        ? ["blogs", debouncedSearch]
        : ["blogData", userId, debouncedSearch],

    queryFn: async ({ pageParam }) => {
      const endpoint =
        type === "admin"
          ? "/blogs/all"
          : `/blogs/${userId}`;

      const res = await api.get(endpoint, {
        params: {
          before: pageParam || undefined,
          search: debouncedSearch || undefined,
        },
      });

      return res.data;
    },

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage?.hasMore
        ? lastPage.nextCursor
        : undefined,

    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

  const blogs = useMemo(() => {
    if (type === "admin") {
      return (
        data?.pages.flatMap(
          (page: any) => page.blogs
        ) ?? []
      );
    }

    return (
      data?.pages.flatMap(
        (page: any) => page.blog
      ) ?? []
    );
  }, [data, type]);

  // Search is performed on the backend; use returned `blogs` directly

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div>
        <input
          className="w-full p-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none rounded"
          placeholder="Search blogs..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {!blogs.length ? (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">
            No blogs found
          </p>
        </div>
      ) : (
        <>
          <Virtuoso
            style={{
              height: type === "admin" ? "70vh" : "60vh",
            }}
            data={blogs}
            endReached={() => {
              if (
                hasNextPage &&
                !isFetchingNextPage
              ) {
                fetchNextPage();
              }
            }}
            itemContent={(index, post) => (
              <div className="mb-4">
                <BlogCard
                  post={post}
                  userId={userId}
                  role={role}
                  index={index}
                />
              </div>
            )}
          />

          <div
            ref={loadMoreRef}
            className="col-span-full h-4"
          />

          {isFetchingNextPage && (
            <div className="col-span-full text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              Loading more blogs...
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Blog;
