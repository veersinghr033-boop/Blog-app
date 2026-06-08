"use client";

import { useEffect, useRef, useState } from "react";

import { io } from "socket.io-client";

interface SortedUser {
    _id: string;
    username: string;
    updatedAt?: string | null;
}

export default function useUserStatus(userId?: string) {
    const socketRef = useRef<any>(null);

    const [statuses, setStatuses] = useState<Record<string, string>>({});
    const [sortedUsers, setSortedUsers] = useState<SortedUser[]>([]);

    useEffect(() => {
        if (!userId) return;

        socketRef.current = io("http://localhost:5050");

        const socket = socketRef.current;

        socket.on("connect", () => {
            socket.emit("userOnline", userId);
        });

        socket.on(
            "userStatus",
            ({ userId, status }: { userId: string; status: string }) => {
                setStatuses((prev) => ({
                    ...prev,
                    [userId]: status,
                }));
            },
        );

       

        let timeout: NodeJS.Timeout;

        const setAway = () => {
            socket.emit("userAway", userId);
        };

        const setOffline = () => {
            socket.emit("userOffline", userId);
        };

        const resetTimer = () => {
            clearTimeout(timeout);

            socket.emit("userOnline", userId);

            timeout = setTimeout(setAway, 3 * 60 * 1000);

            timeout = setTimeout(setOffline, 20 * 60 * 1000);
        };

        window.addEventListener("mousemove", resetTimer);

        window.addEventListener("keydown", resetTimer);

        window.addEventListener("click", resetTimer);

        const handleHidden = () => {
            if (document.hidden) {
                socket.emit("userAway", userId);
            } else {
                socket.emit("userOnline", userId);
            }
        };

        document.addEventListener("visibilitychange", handleHidden);

        const handleUnload = () => {
            socket.emit("userOffline", userId);

            socket.disconnect();
        };

        window.addEventListener("beforeunload", handleUnload);

        window.addEventListener("pagehide", handleUnload);

        resetTimer();

        return () => {
            clearTimeout(timeout);

            window.removeEventListener("mousemove", resetTimer);

            window.removeEventListener("keydown", resetTimer);

            window.removeEventListener("click", resetTimer);

            document.removeEventListener("visibilitychange", handleHidden);

            window.removeEventListener("beforeunload", handleUnload);

            window.removeEventListener("pagehide", handleUnload);

            socket.off("sortedUsers");
            socket.disconnect();
        };
    }, [userId]);

    return { statuses, sortedUsers };
}
