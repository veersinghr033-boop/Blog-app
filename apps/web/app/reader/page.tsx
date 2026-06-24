"use client"

import { Layout} from "antd"
import { useEffect } from "react"
import ReaderBlog from "@/components/ui/ReaderBlog/ReaderBlog"
import { useAppDispatch  ,useAppSelector } from "@/lib/store/hooks"
import { fetchAllBlogs } from "@/lib/store/features/blogThunk"
import api from "@/utills/axios"
import { useInfiniteQuery } from "@tanstack/react-query"

function Page() {
  const dispatch = useAppDispatch()
  

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["blogs"],

    queryFn: async ({ pageParam }) => {
      const before = pageParam
        ? `?before=${pageParam}`
        : "";

      const res = await api.get(
        `/blogs/all${before}`
      );

      return res.data;
    },

    initialPageParam: null,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? lastPage.nextCursor
        : undefined,
  });
  const blogs =
    data?.pages.flatMap(
      (page) => page.blogs
    ) ?? [];
  
  return (
    <Layout className="min-h-screen">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">
          Reader Dashboard
        </h2>

        <p className="text-gray-500">
          Explore and read amazing blogs
        </p>
      </header>
      <ReaderBlog data={blogs} hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage} />

      
    </Layout>
  )
}

export default Page