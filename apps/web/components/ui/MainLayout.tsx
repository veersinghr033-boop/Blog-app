"use client"

import { Layout, Drawer, notification } from "antd"
import Navbar from "./navbar"
import Sidebar from "./sidebar"
import { useState, useEffect } from "react"
import useUserStatus from "../ui/message/useUserStatus"
import { useAppSelector } from "@/lib/store/hooks"

const { Content } = Layout

function MainLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    const userId = useAppSelector((state) => state.auth.user?.id);

    const userStatus = useUserStatus(userId);

    useEffect(() => {
        if (!userStatus.latestNotification) return;
        console.log(userStatus.latestNotification)

        const senderName =
            userStatus.latestNotification?.senderName ||
            userStatus.latestNotification?.sender?.username ||
            userStatus.latestNotification?.sender?.name ||
            "Someone";
        const senderId = userStatus.latestNotification?.senderId
        const fullMsg = userStatus.latestNotification.message || "";
        const first10Words = fullMsg.split(/\s+/).filter(Boolean).slice(0, 7).join(" ") + (fullMsg.split(/\s+/).filter(Boolean).length > 10 ? "..." : "");
        if (userStatus.latestNotification.groupId) {
           
            notification.info({
                message: `New Message in ${userStatus.latestNotification.groupName || "a group"} sent by ${senderName}`,
                description: ` ${first10Words} `,
                placement: "topRight",
                duration: 1.5,
            });
        } else {
            notification.info({
                message: "New Message sent by " + senderName,
                description: `${first10Words}`,
                placement: "topRight",
                duration: 1.5,
            });
        }
    }, [userStatus.latestNotification]);

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
                        md:ml-62.5
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