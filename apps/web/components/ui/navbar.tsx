"use client"

import { Layout, Avatar, Button } from "antd"
import { MenuOutlined } from "@ant-design/icons"
import { useAppSelector } from "@/lib/store/hooks"
import Link from "next/link"

const { Header } = Layout

interface NavbarProps {
    onMenuClick?: () => void
}

function Navbar({ onMenuClick }: NavbarProps) {
    const userName = useAppSelector(
        (state) => state.auth.user?.userName || "User"
    )

    const userRole = useAppSelector(
        (state) => state.auth.user?.role || "reader"
    )

    const menuByRole: Record<string, { href: string }> = {
        admin: { href: "/admin/profile" },
        author: { href: "/author/profile" },
        reader: { href: "/reader/profile" },
    }

    const profilePath =
        menuByRole[userRole]?.href || "/reader/profile"

    return (
        <Header className="!bg-white sticky top-0 z-50 border-b border-gray-200 px-2! md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Button
                    type="text"
                    icon={<MenuOutlined />}
                    className="md:hidden!"
                    onClick={onMenuClick}
                />

                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                    B
                </div>

                <h2 className="text-base md:text-lg font-semibold">
                    BlogPlatform
                </h2>
            </div>

            <Link
                href={profilePath}
                className="flex items-center gap-2 md:gap-3"
            >
                <span className="hidden sm:block capitalize font-medium">
                    {userName}
                </span>

                <Avatar className="!bg-black">
                    {userName[0]?.toUpperCase()}
                </Avatar>
            </Link>
        </Header>
    )
}

export default Navbar