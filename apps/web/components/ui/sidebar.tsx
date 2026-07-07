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
    AppstoreOutlined,
    MessageOutlined
} from "@ant-design/icons"
import { setActiveRole } from "@/lib/store/features/auth";
import { useEffect } from "react"
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

    user: [
        { label: "Home", href: "/user", icon: <HomeOutlined /> },
        { label: "Saved Blogs", href: "/user/save", icon: <BookOutlined /> },
        { label: "Reports", href: "/user/reports", icon: <AppstoreOutlined /> },
        { label: "Create Blog", href: "/user/create", icon: <EditOutlined /> },
        { label: "My Blogs", href: "/user/blogs", icon: <BookOutlined /> },
        { label: "Messages", href: "/user/messages", icon: <MessageOutlined /> }
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

    const roles = useAppSelector((state: any) => state.auth.user?.roles || [state.auth.user?.role])
    const activeRole = useAppSelector(
        (state: any) => state.auth.activeRole
    );
    console.log("pathname:", pathname)
    const menu =
        activeRole === "admin"
            ? menuByRole.admin
            : menuByRole.user;
    useEffect(() => {
        console.log("Sidebar Mounted");

        return () => {
            console.log("Sidebar Unmounted");
        };
    }, []);
    const handleRoleChange = (role: string) => {
        dispatch(setActiveRole(role));

        if (role === "admin") {
            router.push("/admin");
        } else {
            router.push("/user");
        }
    };
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
                {roles.length > 1 && (
                    <select
                        value={activeRole}
                        onChange={(e) =>
                            handleRoleChange(e.target.value)
                        }
                        className="w-11/12 mb-4 border rounded-lg px-3 py-2"
                    >
                        {roles.includes("admin") && (
                            <option value="admin">
                                Admin
                            </option>
                        )}

                        {roles.includes("user") && (
                            <option value="user">
                                User
                            </option>
                        )}
                    </select>
                )}
                {menu?.map((item) => {
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