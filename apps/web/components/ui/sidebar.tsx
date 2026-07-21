"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { logout } from "@/lib/store/features/authThunk";
import { persistor } from "@/lib/store/store";
import { setActiveRole } from "@/lib/store/features/auth";
import { useEffect, useState } from "react";
import {
    House,
    UsersRound,
    NotebookText,
    LayoutGrid,
    PenLine,
    MessageCircleMore,
    ChartNoAxesCombined,
    LogOutIcon,
} from "lucide-react";

interface SidebarProps {
    mobile?: boolean;
    open?: boolean;
    onClose?: () => void;
}

interface MenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const menuByRole: Record<string, MenuItem[]> = {
    admin: [
        { label: "Dashboard", href: "/admin", icon: <House size={19} /> },
        { label: "Users", href: "/admin/user", icon: <UsersRound size={19} /> },
        { label: "Blogs", href: "/admin/blogs", icon: <NotebookText size={19} /> },
        { label: "Reports", href: "/admin/reports", icon: <LayoutGrid size={19} /> },
    ],

    user: [
        { label: "Home", href: "/user", icon: <House size={19} /> },
        { label: "Saved Blogs", href: "/user/save", icon: <NotebookText size={19} /> },
        {
            label: "Trending Blogs",
            href: "/user/trending",
            icon: <ChartNoAxesCombined size={19} />,
        },
        { label: "Reports", href: "/user/reports", icon: <LayoutGrid size={19} /> },
        { label: "Create Blog", href: "/user/create", icon: <PenLine size={19} /> },
        { label: "My Blogs", href: "/user/blogs", icon: <NotebookText size={19} /> },
        {
            label: "Messages",
            href: "/user/messages",
            icon: <MessageCircleMore size={19} />,
        },
    ],
};

export default function Sidebar({
    mobile = false,
    open = false,
    onClose,
}: SidebarProps) {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const user = useAppSelector((state) => state.auth.user);
    const roles = user?.roles ?? [];

    const activeRole = useAppSelector(
        (state: any) => state.auth.activeRole
    );

    const menu =
        activeRole === "admin"
            ? menuByRole.admin
            : menuByRole.user;

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        return () => { };
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
        const resultAction: any = await dispatch(logout() as any);

        if (logout.fulfilled.match(resultAction)) {
            try {
                await persistor.purge();
            } catch (e) {
                console.log(e);
            }
            router.push("/login");
        }
    };

    if (!mounted) return null;

    const SidebarContent = (
        <div className="h-full flex flex-col">
            <div className="flex-1">
                {roles.length > 1 && (
                    <select
                        value={activeRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-11/12 mb-4 border rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white border-gray-300 dark:border-zinc-700"
                    >
                        {roles.includes("admin") && (
                            <option value="admin">Admin</option>
                        )}

                        {roles.includes("user") && (
                            <option value="user">User</option>
                        )}
                    </select>
                )}

                {menu?.map((item) => {
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="block mb-2 w-11/12"
                        >
                            <div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                ${active
                                        ? "bg-gray-700 text-white"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <span className="w-5">{item.icon}</span>
                                {item.label}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <button
                className="w-11/12 bg-red-100 dark:bg-red-950 border border-red-500 text-red-600 dark:text-red-400 px-3 py-2 rounded flex justify-center items-center gap-2"
                onClick={handleLogout}
            >
                Logout <LogOutIcon size={15} />
            </button>
        </div>
    );

    if (mobile) {
        return (
            <div className="w-64 h-full bg-white dark:bg-zinc-900">
                {SidebarContent}
            </div>
        );
    }

    return (
        <div className="w-64 bg-white dark:bg-zinc-900 fixed left-0 top-16 h-[calc(100vh-64px)] border-r border-gray-200 dark:border-zinc-800">
            <div className="p-4 h-full">
                {SidebarContent}
            </div>
        </div>
    );
}