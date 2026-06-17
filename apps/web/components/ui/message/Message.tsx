"use client";

import { Layout, notification } from "antd";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";

import UserSidebar from "./UserSidebar";
import MessageChat from "./MessageChat";
import useUserStatus from "./useUserStatus";

export default function Message() {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const userId = useAppSelector((state) => state.auth.user?.id);

  const userStatus = useUserStatus(userId);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const activeChatId = selectedUser?.id || selectedUser?._id;

    if (activeChatId) {
      window.localStorage.setItem("activeChatId", activeChatId);
      return;
    }

    window.localStorage.removeItem("activeChatId");
  }, [selectedUser]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;

      window.localStorage.removeItem("activeChatId");
    };
  }, []);

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
