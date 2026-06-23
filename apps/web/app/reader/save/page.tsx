"use client"

import { Layout } from "antd"
import { useEffect } from "react"
import ReaderBlog from "@/components/ui/ReaderBlog/ReaderBlog"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fetchAllBlogs } from "@/lib/store/features/blogThunk"
import { useQuery } from "@tanstack/react-query"
import api from "@/utills/axios"
function page() {

  const { data, isError, error } = useQuery({
    queryKey: ["saved"],
    queryFn: async () => {
      const response = await api.get("/blogsave/get");


      return response.data.blogs ;
    },
  })
  useEffect(() => {
    if (isError) {
      console.error("Error fetching saved blogs:", error);
    }
  }, [isError, error])
  const blogData = data?.map(
    (item: any) => item.blogDetails
  ) || []


  return (
    <Layout className="min-h-screen ">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">
          Saved Blogs
        </h2>
        <p className="text-gray-500">
          View and manage your saved blogs
        </p>
      </header>
      <ReaderBlog data={blogData} />
    </Layout>
  )
}

export default page
