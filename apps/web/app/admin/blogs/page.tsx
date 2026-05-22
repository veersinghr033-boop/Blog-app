"use client"

import { Layout, Table, Input, Button, Select } from "antd"
import Blog from "@/components/ui/blog";
import api from "@/utills/axios";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";
const { Search } = Input

function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const userId = useAppSelector((state) => state.auth.user?.id);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await api.get("/blogs/all");
                setBlogs(response.data.blogs);
            } catch (error) {
                console.error("Error fetching blogs:", error);
            }
        };

        fetchBlogs();
    }, []);
    console.log(blogs)

    return (
        <Layout>
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
            <Blog data={blogs} user={userId} />
        </Layout>
    )
}

export default Blogs