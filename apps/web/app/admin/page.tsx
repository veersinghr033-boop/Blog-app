"use client"

import {  Table } from "antd";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useMemo } from "react";

interface UserType {
  key: string
  name: string
  email: string
  role: string
  status: string
  createdAt: Date
}

function page() {
  const { data: blogs = [] } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await api.get("/blogs/all")
      return response.data.stats
    }
  })  

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["users"],
    queryFn: async ({ pageParam = null }) => {
      const res = await api.get("/users", {
        params: {
          before: pageParam,
        },
      });

      return res.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore
        ? lastPage.nextCursor
        : undefined;
    },
  });

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) ?? [];
  }, [data]);
const  joinAt = (user: UserType) => {
  const date = new Date(user.createdAt);
  return date.toLocaleDateString();
} 

  const cardData = [
    {
      title: "Total Blogs",
      value: blogs.totalBlogs,
      desc: "Published",
      bg: "bg-blue-100",
    },
    {
      title: "Total Views",
      value: blogs.totalViews,
      desc: "All time",
      bg: "bg-green-100",
    },
    {
      title: "Engagement",
      value: blogs.totalComments + blogs.totalLikes,
      desc: "Likes and comments",
      bg: "bg-yellow-100",
    },
  ];
  return (
    <div className="min-h-screen ">
      <header className="w-full pb-4 border-b border-gray-200">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            Admin Dashboard
          </h2>

          <p className="text-sm md:text-base text-gray-500">
            Manage the platform and users
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white ">
          {cardData.map((card, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${card.bg}`}
            >
              <h3 className="text-lg font-semibold">
                {card.title}
              </h3>

              <p className="text-2xl font-bold">
                {card.value}
              </p>

              <p className="text-gray-500">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </header>

      <div className="pt-4 overflow-x-auto">
        <Table
          loading={isLoading}
          dataSource={users}
          rowKey="key"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 5,
            onChange: (page) => {
              const totalLoadedPages = data?.pages.length ?? 0;
              if (
                page > totalLoadedPages &&
                hasNextPage &&
                !isFetchingNextPage
              ) {
                fetchNextPage();
              }
            },
          }}
          columns={[
            {
              title: "Name",
              dataIndex: "userName",
              key: "userName",
            },
            {
              title: "Email",
              dataIndex: "email",
              key: "email",
            },
            {
              title: "Role",
              dataIndex: "role",
              key: "role",
            },

            {
              title: "Joined At",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (value: Date) => joinAt({ createdAt: value } as UserType),}
        
          ]}
        />

      </div>




    </div>
  )
}

export default page
