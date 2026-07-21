"use client";

import MobileDrawer from "@/components/ui/MobileDrawer";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";

import dynamic from "next/dynamic";

const UserSidebar = dynamic(() => import("./UserSidebar"), {
  ssr: false,
});

const MessageChat = dynamic(() => import("./MessageChat"), {
  ssr: false,
});
import useUserStatus from "./useUserStatus";

export default function Message() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userId = useAppSelector((state) => state.auth.user?._id);

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
    <div className="flex h-[calc(100dvh-100px)] min-h-0 w-full overflow-hidden bg-white dark:bg-zinc-950 md:gap-0">
      <div className="hidden h-full md:block md:w-62.5 md:shrink-0">
        <UserSidebar
          selectedUser={selectedUser}
          setSelectedUser={handleSelectUser}
          notifications={userStatus.notifications}
          statuses={userStatus.statuses}
          mobile={false}
        />
      </div>

      {isMobile && (
        <MobileDrawer
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          <UserSidebar
            selectedUser={selectedUser}
            setSelectedUser={handleSelectUser}
            notifications={userStatus.notifications}
            statuses={userStatus.statuses}
            mobile
          />
        </MobileDrawer>
      )}

      <div className="flex min-w-0 flex-1 bg-white dark:bg-zinc-950">
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
