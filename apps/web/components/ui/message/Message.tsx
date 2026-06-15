"use client";

import { Layout, notification } from "antd";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";

import UserSidebar from "./UserSidebar";
import MessageChat from "./MessageChat";
import useUserStatus from "./useUserStatus";

export default function Message() {
  const [selectedUser, setSelectedUser] = useState(null);

  const userId = useAppSelector((state) => state.auth.user?.id);

  const userStatus = useUserStatus(userId);

  // useEffect(() => {
  //   if (!userStatus.latestNotification) return;

  //   const senderName =
  //     userStatus.latestNotification?.senderName ||
  //     userStatus.latestNotification?.sender?.username ||
  //     userStatus.latestNotification?.sender?.name ||
  //     "Someone";
  //   const senderId = userStatus.latestNotification?.senderId

  //   console.log(senderId , userStatus.latestNotification)
  //   if (userStatus.latestNotification.groupId) {
  //     notification.info({
  //       message: "New Group Message",
  //       description: `${senderName} sent a message in ${userStatus.latestNotification.groupName || "Group"}`,
  //       placement: "topRight",
  //       duration: 3,
  //     });
  //   } else {
  //     notification.info({
  //       message: "New Message",
  //       description: `${senderName} sent you a message`,
  //       placement: "topRight",
  //       duration: 3,
  //     });
  //   }
  // }, [userStatus.latestNotification]);

  return (
    <Layout>
      <UserSidebar
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        notifications={userStatus.notifications}
        statuses={userStatus.statuses}
      />

      <Layout.Content>
        <MessageChat
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          notifications={userStatus.notifications}
          clearNotification={userStatus.clearNotification}
        />
      </Layout.Content>
    </Layout>
  );
}
