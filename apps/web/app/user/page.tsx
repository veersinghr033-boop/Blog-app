"use client"
import ReaderBlog from "@/components/ui/ReaderBlog/ReaderBlog";
import api from "@/utills/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";


function Page() {
   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
      useInfiniteQuery({
        queryKey: ["blog"],
        queryFn: async ({ pageParam }) => {
          const before = pageParam ? `?before=${pageParam}` : "";
          const res = await api.get(`/blogs/all${before}`);
          return res.data;
        },
        initialPageParam: null,
  
  
        getNextPageParam: (lastPage) =>
          lastPage?.hasMore ? lastPage?.nextCursor : undefined,
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
      });
  
    const blogs = useMemo(
      () => data?.pages.flatMap((page) => page.blogs) ?? [],
      [data]
    );
  return (
    <div className="min-h-screen">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Reader Dashboard</h2>
        <p className="text-gray-500">Explore and read amazing blogs</p>
      </header>
      <ReaderBlog
        data={blogs}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  );
}
export default Page;
