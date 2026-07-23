"use client"

import { useAppSelector } from "@/lib/store/hooks"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image";
import ThemeToggle from "./Theme";



interface NavbarProps {
    onMenuClick?: () => void
}

function Navbar({ onMenuClick }: NavbarProps) {
    const userName = useAppSelector(
        (state) => state.auth.user?.userName || "User"
    )

    const user = useAppSelector((state) => state.auth.user);

    const roles = user?.roles ?? [];
    const avatar = user?.profileImage || "";

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const displayedName = mounted ? userName : "User";
    const profilePath = mounted
        ? roles.includes("admin")
            ? "/admin/profile"
            : "/user/profile"
        : "/user/profile"




    return (
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50 px-2 py-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    className="md:hidden text-xl"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    ☰
                </button>

                <div className="w-8 h-8 rounded-full bg-gray-700 dark:bg-zinc-200 text-white dark:text-zinc-900 flex items-center justify-center overflow-hidden">
                    B
                </div>

                <h2 className="text-base md:text-lg font-semibold text-black dark:text-white">
                    BlogPlatform
                </h2>
            </div>
            <div className="flex items-center gap-3">
                <Link
                    href={profilePath}
                    className="flex items-center gap-2 md:gap-3"
                    title="Profile"
                >
                    <span
                        suppressHydrationWarning
                        className="hidden sm:block capitalize font-medium"
                    >
                        {mounted ? userName : "User"}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center overflow-hidden">
                        {mounted && avatar ? (
                            <Image
                                src={avatar}
                                alt="avatar"
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs uppercase">
                                {displayedName.charAt(0)}
                            </span>
                        )}
                    </div>
                </Link>
                <ThemeToggle />

            </div>

        </header>
    )
}

export default Navbar