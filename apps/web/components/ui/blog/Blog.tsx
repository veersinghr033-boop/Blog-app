"use client";

import { useEffect, useRef } from "react";
import BlogCard from "./BlogCard";
import { Virtuoso } from "react-virtuoso";

interface BlogProps {
  data: any[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  userId?: string;
  role?: string;
}
function Blog({
  data,
  userId,
  role,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: BlogProps) {

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  if (!data.length) {
    return (
      <div className="text-center py-4">
        <text type="secondary">
          No blogs yet
        </text>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 pt-4 ">
      <Virtuoso
        style={{ height: "100vh" }}
        data={data}
        endReached={() => {
          if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
            fetchNextPage();
          }
        }}
        itemContent={(_, post) => (
          <div className="mb-4">

            <BlogCard
              post={post}
              userId={userId}
              role={role}
            />          </div>
        )}
      />
      <div ref={loadMoreRef} className="col-span-full h-4" />

      {isFetchingNextPage ? (
        <div className="col-span-full text-center py-4 text-sm text-gray-500">
          Loading more blogs...
        </div>
      ) : null}
    </div>
  );
}

export default Blog;
