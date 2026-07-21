"use client";

import { useMemo, useRef, useState } from "react";
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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey:
      type === "admin"
        ? ["blogs"]
        : ["blogData", userId],

    queryFn: async ({ pageParam }) => {
      const endpoint =
        type === "admin"
          ? "/blogs/all"
          : `/blogs/${userId}`;

      const res = await api.get(endpoint, {
        params: {
          before: pageParam || undefined,
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

  const filteredBlogs = useMemo(
    () =>
      searchText
        ? blogs.filter((blog: any) => {
          const search = searchText.toLowerCase();
          return (blog.title?.toLowerCase() || "").includes(search);
        })
        : blogs,
    [blogs, searchText]
  );
  
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div>
        <input
          className="w-full p-2 border border-gray-300 outline-0 rounded"
          placeholder="Search blogs..."
          value={searchText}
          onChange={(e) =>
            setSearchText(e.target.value)
          }
        />
      </div>

      {!filteredBlogs.length ? (
        <div className="text-center py-4">
          <p className="text-gray-500">
            No blogs found
          </p>
        </div>
      ) : (
        <>
          <Virtuoso
            style={{ height: type === "admin" ? "70vh" : "60vh" }}
            data={filteredBlogs}
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
            <div className="col-span-full text-center py-4 text-sm text-gray-500">
              Loading more blogs...
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Blog;
