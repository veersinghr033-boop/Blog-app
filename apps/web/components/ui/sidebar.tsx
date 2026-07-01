"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { logout } from "@/lib/store/features/authThunk"
import { persistor } from "@/lib/store/store"
import {
    HomeOutlined,
    UsergroupAddOutlined,
    BookOutlined,
    EditOutlined,
    LoginOutlined,
    AppstoreOutlined,
    MessageOutlined
} from "@ant-design/icons"

interface SidebarProps {
    mobile?: boolean
    open?: boolean
    onClose?: () => void
}
interface MenuItem {
    label: string
    href: string
    icon: React.ReactNode
}

const menuByRole: Record<string, MenuItem[]> = {
    admin: [
        { label: "Dashboard", href: "/admin", icon: <HomeOutlined /> },
        { label: "Users", href: "/admin/user", icon: <UsergroupAddOutlined /> },
        { label: "Blogs", href: "/admin/blogs", icon: <BookOutlined /> },
        { label: "Reports", href: "/admin/reports", icon: <AppstoreOutlined /> },
    ],

    reader: [
        { label: "Home", href: "/reader", icon: <HomeOutlined /> },
        { label: "Saved Blogs", href: "/reader/save", icon: <BookOutlined /> },
        { label: "Reports", href: "/reader/reports", icon: <AppstoreOutlined /> },
        { label: "Create Blog", href: "/reader/create", icon: <EditOutlined /> },
        { label: "My Blogs", href: "/reader/blogs", icon: <BookOutlined /> },
        { label: "Messages", href: "/reader/messages", icon: <MessageOutlined /> }
    ],
}


export default function Sidebar({
    mobile = false,
    open = false,
    onClose,
}: SidebarProps) {
    const pathname = usePathname()
    const dispatch = useAppDispatch()
    const router = useRouter()

    const role = useAppSelector((state: any) => state.auth.user?.role)

    const handleLogout = async () => {
        const resultAction: any = await dispatch(logout() as any)

        if (logout.fulfilled.match(resultAction)) {
            // lightweight notification
            try {
                await persistor.purge()
            } catch (e) {
                // ignore
            }
            router.push("/login")
        }
    }

    const SidebarContent = (
        <div className="h-full flex flex-col">
            <div className="flex-1">
                {menuByRole[role]?.map((item: any) => {
                    const active = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="block mb-2 w-11/12"
                        >
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-gray-700
                                ${active
                                        ? "bg-gray-700 text-white"
                                        : "hover:bg-gray-100"
                                    }`}>
                                <span className="w-5">{item.icon}</span>
                                {item.label}
                            </div>
                        </Link>
                    )
                })}
            </div>

            <button
                className="w-11/12 bg-red-500 text-white px-3 py-2 rounded"
                onClick={handleLogout}
            >
                Logout
            </button>
        </div>
    )


    if (mobile) {
        return (
            <div className="w-64 h-full">{SidebarContent}</div>
        )
    }

    return (
        <div className="w-64 bg-white fixed left-0 top-16 h-[calc(100vh-64px)] border-r border-gray-200">
            <div className="p-4 h-full">{SidebarContent}</div>
        </div>
    )
}