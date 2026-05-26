"use client"

import { Layout } from "antd";
import { EyeOutlined, LikeOutlined } from "@ant-design/icons";
function page() {
  const cardData = [
    {
      icon: <EyeOutlined />,
      title: "Total Blogs",
      value: 12,
      desc: "Published",
      bg: "bg-blue-100",
    },
    {
      icon: < LikeOutlined />,
      title: "Total Likes",
      value: 1200,
      desc: "All time",
      bg: "bg-green-100",
    },{
      icon: <EyeOutlined />,
      title: "Total Comments",
      value: 1200,
      desc: "All time",
      bg: "bg-red-100",
    },{
      icon: <LikeOutlined />,
      title: "Engagement",
      value: 300,
      desc: "Likes and comments",
      bg: "bg-yellow-100",
    }
  ]
  return (
    <Layout className="min-h-screen bg-white">
      <header className="flex flex-col w-full gap-4 border-b border-gray-200 ">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard </h2>

          <p className="text-gray-500">Track your content performance</p>
        </div>
        <div className="flex justify-between gap-4">
          {cardData.map((card, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg flex-1 ${card.bg} flex items-center gap-4`}
            >
              <div className="text-3xl">
                {card.icon}
              </div>
              <div>
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
            </div>
          ))}
        </div>
      </header>

    </Layout>
  )
}

export default page
