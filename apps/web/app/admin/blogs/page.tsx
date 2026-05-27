"use client"

import { Layout, Input, Select } from "antd"
import Blog from "@/components/ui/blog"
import { useEffect, useMemo, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { fetchAllBlogs } from "@/lib/store/features/blogThunk"

const { Search } = Input

function Blogs() {
    const blogs = useAppSelector((state) => state.blog.blogs)
    const loading = useAppSelector((state) => state.blog.loading)

    const dispatch = useAppDispatch()

    const [searchText, setSearchText] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        dispatch(fetchAllBlogs() as any)
    }, [dispatch])

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
            <header className="flex flex-col w-full gap-4 border-b border-gray-200 px-3 py-4">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Blogs Management
                    </h2>

                    <p className="text-gray-500">
                        Manage platform blogs and content
                    </p>
                </div>

                <div className="flex w-full gap-3">
                    <Search
                        className="w-3/4"
                        placeholder="Search blogs..."
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    {/* <Select
                        className="w-1/4"
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        placeholder="Filter by status"
                    >
                        <Select.Option value="">
                            All Status
                        </Select.Option>

                        <Select.Option value="published">
                            Published
                        </Select.Option>

                        <Select.Option value="draft">
                            Draft
                        </Select.Option>
                    </Select> */}
                </div>
            </header>

            <div className="p-3">
                <Blog data={filteredBlogs}  />
            </div>
        </Layout>
    )
}

export default Blogs