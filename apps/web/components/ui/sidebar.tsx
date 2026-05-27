"use client"

import { Button, Layout, message } from "antd"
import {
    HomeOutlined,
    UsergroupAddOutlined,
    BookOutlined,
    EditOutlined,
    LoginOutlined,
    AppstoreOutlined,
} from "@ant-design/icons"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { logout } from "@/lib/store/features/authThunk"
import { persistor } from "@/lib/store/store"
import { useRouter } from "next/navigation"

const { Sider } = Layout
interface MenuItem {
    label: string
    href: string
    icon: React.ReactNode
}

const menuByRole: { [key: string]: MenuItem[] } = {
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
            href: "/admin/profile",
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
        // {
        //     label: "Read Blogs",
        //     href: "/reader/blogs",
        //     icon: <ReadOutlined />,
        // },
        {
            label: "Saved Blogs",
            href: "/reader/save",
            icon: <BookOutlined />,
        },
    ],
}

function Sidebar() {
    const pathname = usePathname()
    const dispatch = useAppDispatch()
    const router = useRouter();

    const role = useAppSelector((state: any) => state.auth.user?.role)

    const handleLogout = async () => {
        try {
            const resultAction: any = await dispatch(logout() as any);
            if (logout.fulfilled.match(resultAction)) {
                message.success("Logout successful");
                await persistor.purge();

                router.push("/login");
            } else {
                message.error(resultAction.payload || "Logout failed");
            }
        } catch (error) {
            message.error("An error occurred during logout");
        }
    };

    return (
        <Sider className="bg-white! fixed! left-0! top-15  border-r p-4 border-gray-200! min-h-11/12">

            {menuByRole[role]?.map((item: MenuItem) => {
                const active = pathname === item.href

                return (
                    <Link
                        href={item.href}
                        key={item.href}
                        className="no-underline mb-2 block"
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
            <Button
                type="text"
                onClick={handleLogout}
                className="flex items-center gap-3 px-4! py-3! rounded-2xl! transition!
                        text-gray-700! bg-gray-100! absolute! bottom-4! left-4! w-[calc(100%-32px)] hover:bg-gray-200!"
            >

                < LoginOutlined />
                <span>Logout</span>
            </Button>


        </Sider>
    )
}

export default Sidebar