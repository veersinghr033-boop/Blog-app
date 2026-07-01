"use client"

import { Layout } from "antd"
import ReaderBlog from "@/components/ui/ReaderBlog/ReaderBlog"
import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/utills/axios"

function page() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["saved"],

    queryFn: async ({ pageParam }) => {
      const before = pageParam
        ? `?before=${encodeURIComponent(String(pageParam))}`
        : "";

      const response = await api.get(`/blogsave/get${before}`);

      return response.data;
    },

    initialPageParam: null,

    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextCursor : undefined,
  });

  const blogs =
    data?.pages.flatMap((page) => {
      const items = Array.isArray(page?.blogs)
        ? page.blogs
        : Array.isArray(page)
          ? page
          : [];

      return items.map((item: any) => item?.blogDetails ?? item);
    }) ?? [];
  // console.log(blogs, fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,)
  return (
    <div className="min-h-screen ">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">
          Saved Blogs
        </h2>
        <p className="text-gray-500">
          View and manage your saved blogs
        </p>
      </header>
      <ReaderBlog data={blogs} hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage} />
    </div>
  )
}

export default page
