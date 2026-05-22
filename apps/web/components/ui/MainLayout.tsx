"use client"

import { Layout } from "antd"
import Navbar from "./navbar"
import Sidebar from "./sidebar"

const { Content } = Layout

function MainLayout({ children, role }: { children: React.ReactNode, role: string }) {
    return (
        <Layout className="min-h-screen relative">
            <Navbar role={role} />

            <Layout>
                <Sidebar role={role}  />

                <Content className="bg-gray-50 h-full md:ml-50 ">
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout