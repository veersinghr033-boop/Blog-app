"use client"

import { Layout, Avatar } from "antd"

const { Header } = Layout

function Navbar({ role }: { role: string }) {
    return (
        <Header className="bg-white! sticky top-0 z-10  border-b border-gray-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                    B
                </div>

                <h2 className="text-lg font-semibold">
                    BlogPlatform
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <span className="capitalize font-medium">
                    {role}
                </span>

                <Avatar className="bg-black">
                    {role[0].toUpperCase()}
                </Avatar>
            </div>
        </Header>
    )
}

export default Navbar