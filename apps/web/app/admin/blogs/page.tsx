"use client"

import { Layout, Input, Select } from "antd"
import Blog from "@/components/ui/blog/Blog"
import { useEffect, useMemo, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { fetchAllBlogs } from "@/lib/store/features/blogThunk"
import api from "@/utills/axios"
import { useQuery } from "@tanstack/react-query"

const { Search } = Input

function Blogs() {
    const loading = useAppSelector((state) => state.blog.loading)
    const user = useAppSelector((state) => state.auth.user)

    const dispatch = useAppDispatch()

    const [searchText, setSearchText] = useState("")
    const [statusFilter, setStatusFilter] = useState("")


    const { data: blogs = [], isLoading } = useQuery({
        queryKey: ["blogs"],
        queryFn: async () => {
            const response = await api.get("/blogs/all")
            return response.data.blogs
        }
    })

    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog: any) => {
            const matchesSearch =
                blog.title
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                blog.description
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase())

            const matchesStatus =
                statusFilter === "" ||
                blog.status?.toLowerCase() === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [blogs, searchText, statusFilter])

    return (
        <Layout className="min-h-screen bg-white">
            <header className="w-full border-b border-gray-200 px-4 py-4">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Blogs Management
                    </h2>

                    <p className="text-gray-500">
                        Manage platform blogs and content
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row w-full gap-3">
                    <Search
                        className="w-full sm:flex-1"
                        placeholder="Search blogs..."
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    
                </div>
            </header>

            <div className="p-3">
                <Blog data={filteredBlogs} />
            </div>
        </Layout>
    )
}

export default Blogs