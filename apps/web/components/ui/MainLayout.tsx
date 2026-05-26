"use client"

import { Layout } from "antd"
import Navbar from "./navbar"
import Sidebar from "./sidebar"

const { Content } = Layout

function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout className="min-h-screen relative">
            <Navbar  />

            <Layout>
                <Sidebar/>

                <Content className=" h-full md:ml-50 p-5 ">
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout