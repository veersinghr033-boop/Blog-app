"use client"

import { Layout, Drawer } from "antd"
import Navbar from "./navbar"
import Sidebar from "./sidebar"
import { useState } from "react"

const { Content } = Layout

function MainLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    return (
        <Layout className="min-h-screen">
            <Navbar onMenuClick={() => setOpen(true)} />

            <Layout>
                <div className="hidden md:block">
                    <Sidebar />
                </div>
                <Drawer
                    placement="left"
                    open={open}
                    onClose={() => setOpen(false)}
                    width={250}
                    
                >
                    <Sidebar />
                </Drawer>

                <Content
                    className="
                        p-2
                        md:p-6
                        md:ml-[250px]
                        min-h-screen
                        overflow-auto
                        
                    "
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout