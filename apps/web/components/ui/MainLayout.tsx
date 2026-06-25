"use client"

import { Layout, Drawer } from "antd"
import Navbar from "./navbar"
import Sidebar from "./sidebar"
import {  useState } from "react"


const { Content } = Layout

function MainLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    //     if (!userStatus.latestNotification) return;

    //     if (typeof document !== "undefined" && document.hidden) {
    //         return;
    //     }

    //     const senderName =
    //         userStatus.latestNotification?.senderName ||
    //         userStatus.latestNotification?.sender?.username ||
    //         userStatus.latestNotification?.sender?.name ||
    //         "Someone";
    //     const senderId = userStatus.latestNotification?.senderId
    //     const fullMsg = userStatus.latestNotification.message || "";
    //     const first10Words = fullMsg.split(/\s+/).filter(Boolean).slice(0, 7).join(" ") + (fullMsg.split(/\s+/).filter(Boolean).length > 10 ? "..." : "");
    //     const notificationKey = JSON.stringify({
    //         senderId: typeof senderId === "string" ? senderId : senderId?._id,
    //         groupId: userStatus.latestNotification.groupId || null,
    //         receiverId: userStatus.latestNotification.receiverId || null,
    //         message: fullMsg,
    //         timestamp: userStatus.latestNotification.timestamp || null,
    //         type: userStatus.latestNotification.type || null,
    //     });

    //     if (lastNotificationKeyRef.current === notificationKey) {
    //         return;
    //     }

    //     lastNotificationKeyRef.current = notificationKey;

    //     if (userStatus.latestNotification.groupId) {

    //         notification.info({
    //             message: `New Message in ${userStatus.latestNotification.groupName || "a group"} sent by ${senderName}`,
    //             description: ` ${first10Words} `,
    //             placement: "topRight",
    //             duration: 1.5,
    //         });
    //     } else {
    //         notification.info({
    //             message: "New Message sent by " + senderName,
    //             description: `${first10Words}`,
    //             placement: "topRight",
    //             duration: 1.5,
    //         });
    //     }
    // }, [userStatus.latestNotification]);

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