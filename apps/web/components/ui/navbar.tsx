"use client"

import { useAppSelector } from "@/lib/store/hooks"
import Link from "next/link"


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
        reader: { href: "/reader/profile" },
    }

    const profilePath =
        menuByRole[userRole]?.href || "/reader/profile"

    return (
        <header className="bg-white sticky top-0 z-50 border-b border-gray-200 px-2 py-3 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    className="md:hidden text-xl"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    ☰
                </button>

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
                title="Profile"
            >
                <span className="hidden sm:block capitalize font-medium">
                    {userName}
                </span>

                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                    {userName[0]?.toUpperCase()}
                </div>
            </Link>
        </header>
    )
}

export default Navbar