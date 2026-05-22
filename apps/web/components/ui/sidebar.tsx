"use client"

import { Layout } from "antd"
import {
    HomeOutlined,
    UsergroupAddOutlined,
    BookOutlined,
    AppstoreOutlined,
    EditOutlined,
    ReadOutlined,
} from "@ant-design/icons"

import Link from "next/link"
import { usePathname } from "next/navigation"

const { Sider } = Layout
interface MenuItem {
    label: string
    href: string
    icon: React.ReactNode
}

const menuByRole = {
    admin: [
        {
            label: "Dashboard",
            href: "/admin",
            icon: <HomeOutlined />,
        },
        {
            label: "Users",
            href: "/admin/user",
            icon: <UsergroupAddOutlined />,
        },
        {
            label: "Blogs",
            href: "/admin/blogs",
            icon: <BookOutlined />,
        },
        {
            label: "Categories",
            href: "/admin/categories",
            icon: <AppstoreOutlined />,
        },
    ],

    author: [
        {
            label: "Dashboard",
            href: "/author",
            icon: <HomeOutlined />,
        },
        {
            label: "My Blogs",
            href: "/author/blogs",
            icon: <BookOutlined />,
        },
        {
            label: "Create Blog",
            href: "/author/create",
            icon: <EditOutlined />,
        },
    ],

    reader: [
        {
            label: "Home",
            href: "/reader",
            icon: <HomeOutlined />,
        },
        {
            label: "Read Blogs",
            href: "/reader/blogs",
            icon: <ReadOutlined />,
        },
        {
            label: "Saved Blogs",
            href: "/reader/saved",
            icon: <BookOutlined />,
        },
    ],
}

function Sidebar({ role }: { role: string }) {
    const pathname = usePathname()

    return (
        <Sider className="bg-white! fixed! left-0! top-15 border-r border-gray-200! min-h-11/12">
            <div className="p-4 flex flex-col gap-2">
                {menuByRole[role]?.map((item: MenuItem) => {
                    const active = pathname === item.href

                    return (
                        <Link
                            href={item.href}
                            key={item.href}
                            className="no-underline"
                        >
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition
                                ${active
                                        ? "bg-gray-700 text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </Sider>
    )
}

export default Sidebar