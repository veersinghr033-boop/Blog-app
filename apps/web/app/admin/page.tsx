"use client"

import { Layout } from "antd";


function page() {
  return (
    <Layout className="min-h-screen bg-white">
      <header>
        <div>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <p className="text-gray-500">Manage the platform and users</p>
        </div>
      </header>
    </Layout>
  )
}

export default page
