"use client"

import { Layout} from "antd"
import { useEffect } from "react"
import ReaderBlog from "@/components/ui/readerBlog"
import { useAppDispatch , useAppSelector } from "@/lib/store/hooks"
import { getSavedBlogs  } from "@/lib/store/features/saveThunk"
import { fetchAllBlogs } from "@/lib/store/features/blogThunk"
function page() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getSavedBlogs() as any)
  }, [])
  const savedBlogs = useAppSelector((state) => state.save.savedBlogs)
    const blogData = savedBlogs.flatMap(
        (item: any) => item.blogDetails
    )

    // console.log("blogs:", blogData)


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
