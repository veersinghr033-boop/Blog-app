"use client"

import { Layout} from "antd"
import { useEffect } from "react"
import ReaderBlog from "@/components/ui/readerBlog"
import { useAppDispatch  ,useAppSelector } from "@/lib/store/hooks"
import { fetchAllBlogs } from "@/lib/store/features/blogThunk"

function Page() {
  const dispatch = useAppDispatch()
  

  useEffect(() => {
    dispatch(fetchAllBlogs() as any)
  }, [dispatch])
  const blogs = useAppSelector((state) => state.blog.blogs)

 
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