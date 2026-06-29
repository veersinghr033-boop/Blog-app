"use client";

import { useEffect, useRef } from "react";
import BlogCard from "./BlogCard";
import { Virtuoso } from "react-virtuoso";

interface BlogProps {
  data: any[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}
function Blog({
  data,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: BlogProps) {

  const loadMoreRef = useRef<HTMLDivElement | null>(null);





  // useEffect(() => {
  //   if (!hasNextPage || !fetchNextPage || isFetchingNextPage) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       const firstEntry = entries[0];
  //       if (firstEntry?.isIntersecting) {
  //         fetchNextPage();
  //       }
  //     },
  //     { threshold: 0.2 },
  //   );

  //   const current = loadMoreRef.current;
  //   if (current) {
  //     observer.observe(current);
  //   }

  //   return () => {
  //     if (current) {
  //       observer.unobserve(current);
  //     }
  //   };
  // }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!data.length) {
    return (
      <div className="text-center py-4">
        <text type="secondary">
          No comments yet
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

            <BlogCard post={post} />
          </div>
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
