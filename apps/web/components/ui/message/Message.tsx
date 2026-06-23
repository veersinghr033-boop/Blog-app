"use client";

import { Drawer } from "antd";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";

import UserSidebar from "./UserSidebar";
import MessageChat from "./MessageChat";
import useUserStatus from "./useUserStatus";

export default function Message() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userId = useAppSelector((state) => state.auth.user?.id);

  const userStatus = useUserStatus(userId);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(!selectedUser);
      return;
    }

    setSidebarOpen(false);
  }, [isMobile, selectedUser]);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

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
    <div className="flex h-[calc(100dvh-115px)] min-h-0 w-full overflow-hidden md:gap-0">
      <div className="hidden h-full md:block md:w-62.5 md:shrink-0">
        <UserSidebar
          selectedUser={selectedUser}
          setSelectedUser={handleSelectUser}
          notifications={userStatus.notifications}
          statuses={userStatus.statuses}
          mobile={false}
        />
      </div>

      <Drawer
        placement="left"
        open={isMobile && sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width="80%"
        closable
        bodyStyle={{ padding: 0 }}
      >
        <UserSidebar
          selectedUser={selectedUser}
          setSelectedUser={handleSelectUser}
          notifications={userStatus.notifications}
          statuses={userStatus.statuses}
          mobile
        />
      </Drawer>

      <div className="flex min-w-0 flex-1">
        <MessageChat
          selectedUser={selectedUser}
          setSelectedUser={handleSelectUser}
          notifications={userStatus.notifications}
          clearNotification={userStatus.clearNotification}
          mobile={isMobile}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}
