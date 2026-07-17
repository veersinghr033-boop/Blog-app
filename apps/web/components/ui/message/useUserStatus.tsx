"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getSocket } from "@/utills/socket";
export default function useUserStatus(userId?: string) {
  const socketRef = useRef<any>(null);

  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<Record<string, number>>(
    {},
  );
  const [latestNotification, setLatestNotification] = useState<any>(null);

  const getActiveChatId = useCallback(() => {
    if (typeof window === "undefined") return null;

    return window.localStorage.getItem("activeChatId");
  }, []);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    // console.log(socket)
    socketRef.current = socket;

    const handleConnect = () => {
      socket.emit("userOnline", userId);
    };

    const handleStatus = ({
      userId: statusUserId,
      status,
    }: {
      userId: string;
      status: string;
    }) => {
      setStatuses((prev) => ({
        ...prev,
        [statusUserId]: status,
      }));
    };

    const handleNotification = (data: any) => {
      const senderKey =
        typeof data?.senderId === "string"
          ? data.senderId
          : data?.senderId?._id;

      const key =
        data?.groupId ||
        (data?.type === "private" ? senderKey : data?.receiverId);

      if (!key) return;

      const activeChatId = getActiveChatId();

      if (senderKey === userId || activeChatId === key) return;

      setNotifications((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + 1,
      }));
      setLatestNotification(data);
    };

    let awayTimeout: ReturnType<typeof setTimeout>;
    let offlineTimeout: ReturnType<typeof setTimeout>;

    const setAway = () => {
      socket.emit("userAway", userId);
    };

    const setOffline = () => {
      socket.emit("userOffline", userId);
    };

    const resetTimer = () => {
      clearTimeout(awayTimeout);
      clearTimeout(offlineTimeout);

      socket.emit("userOnline", userId);

      awayTimeout = setTimeout(setAway, 3 * 60 * 1000);
      offlineTimeout = setTimeout(setOffline, 20 * 60 * 1000);
    };

    const handleHidden = () => {
      if (document.hidden) {
        socket.emit("userAway", userId);
      } else {
        socket.emit("userOnline", userId);
      }
    };

    const handleUnload = () => {
      socket.emit("userOffline", userId);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("userStatus", handleStatus);
    socket.on("newNotification", handleNotification);

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    document.addEventListener("visibilitychange", handleHidden);

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    resetTimer();
    return () => {
      clearTimeout(awayTimeout);
      clearTimeout(offlineTimeout);

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);

      document.removeEventListener("visibilitychange", handleHidden);

      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);

      socket.off("connect", handleConnect);
      socket.off("userStatus", handleStatus);
      socket.off("newNotification", handleNotification);
    };
  }, [getActiveChatId, userId]);
  const clearNotification = useCallback((id?: string) => {
    if (!id) return;

    setNotifications((prev) => {
      if (!prev[id]) return prev;

      return {
        ...prev,
        [id]: 0,
      };
    });
  }, []);

  return {
    statuses,
    notifications,
    latestNotification,
    clearNotification,
  };
}
