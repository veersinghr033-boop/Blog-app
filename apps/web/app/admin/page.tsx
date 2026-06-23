"use client"

import { Layout, Table, Popconfirm } from "antd";
import { useAppSelector } from "@/lib/store/hooks";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utills/axios";

interface UserType {
  key: string
  name: string
  email: string
  role: string
  status: string
  joined: string
}

function page() {
  const { data: blogs = [] } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await api.get("/blogs/all")
      return response.data.blogs
    }
  })

  const totalEngagement = useMemo(() => {
    return blogs.reduce((total: number, b: any) => {
      return total + (b.likes?.count || 0) + (b.comments?.count || 0)
    }, 0);
  }, [blogs]);
  const totalViews = useMemo(() => {
    return blogs.reduce((total: number, b: any) => {
      return total + (b.views && b.views.length > 0 ? b.views[0].count : 0);
    }, 0);
  }, [blogs]);

  const {
    data: users = [],
    isLoading,
  } = useQuery<UserType[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users")

      return response.data.map((user: any) => ({
        key: user._id,
        name: user.userName,
        email: user.email,
        role: user.role,
        joined: new Date(user.createdAt).toLocaleDateString(),
      }))
    },
  })

  const cardData = [
    {
      title: "Total Blogs",
      value: blogs.length,
      desc: "Published",
      bg: "bg-blue-100",
    },
    {
      title: "Total Views",
      value: totalViews,
      desc: "All time",
      bg: "bg-green-100",
    },
    {
      title: "Engagement",
      value: totalEngagement,
      desc: "Likes and comments",
      bg: "bg-yellow-100",
    },
  ];
  return (
    <Layout className="min-h-screen bg-white">
      <header className="w-full pb-4 border-b border-gray-200">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            Admin Dashboard
          </h2>

          <p className="text-sm md:text-base text-gray-500">
            Manage the platform and users
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
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
              dataIndex: "joined",
              key: "joined",
            },
        
          ]}
        />

      </div>




    </Layout>
  )
}

export default page
