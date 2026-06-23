"use client"

import { Layout} from "antd"
import { useEffect } from "react"
import ReaderBlog from "@/components/ui/ReaderBlog/ReaderBlog"
import { useAppDispatch  ,useAppSelector } from "@/lib/store/hooks"
import { fetchAllBlogs } from "@/lib/store/features/blogThunk"
import api from "@/utills/axios"
import { useQuery } from "@tanstack/react-query"

function Page() {
  const dispatch = useAppDispatch()
  

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await api.get("/blogs/all")
      return response.data.blogs
    }
  })
  
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
      <ReaderBlog data={blogs} />

      
    </Layout>
  )
}

export default Page