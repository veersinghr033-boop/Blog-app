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
