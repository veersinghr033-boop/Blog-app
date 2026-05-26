"use client"

import { Layout, Table, Input, Button, Select } from "antd"
import Blog from "@/components/ui/blog";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { fetchAllBlogs } from "@/lib/store/features/blogThunk";
const { Search } = Input

function Blogs() {
    const blogs = useAppSelector((state) => state.blog.blogs);
    const userId = useAppSelector((state) => state.auth.user?.id);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchAllBlogs() as any);
    }, [dispatch]);

    return (
        <Layout className="min-h-screen bg-white">
            <header className="flex flex-col w-full  gap-4 border-b border-gray-200 px-6 py-4">
                <div >
                    <h2 className="text-2xl">Blogs Management</h2>
                    <p className="text-gray-500">Manage platform blogs and content</p>
                </div>
                <div className="flex w-full gap-3 ">
                    <Search className="w-3/4!" placeholder="Search blogs..." />
                    <Select className="w-1/4 mt-2">
                        <Select.Option value="">All Status</Select.Option>
                        <Select.Option value="published">published</Select.Option>
                        <Select.Option value="draft">Draft</Select.Option>
                    </Select>

                </div>
            </header>
            <Blog data={blogs}  />
        </Layout>
    )
}

export default Blogs