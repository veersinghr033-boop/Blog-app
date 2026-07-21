"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import MessageHeader from "./MessageHeader";
import { getSocket } from "@/utills/socket";

export default function MessageChat({
  selectedUser,
  setSelectedUser,
  clearNotification,
  mobile,
  onOpenSidebar,
}: any) {
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
  const socketRef = useRef<any>(null);
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const handleStatus = ({ userId, status }: any) => {
      setUserStatuses((prev) => ({
        ...prev,
        [userId]: status,
      }));
    };

    socket.on("userStatus", handleStatus);

    return () => {
      socket.off("userStatus", handleStatus);
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
      <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-900">
        <MessageHeader
          selectedUser={selectedUser}
          userStatuses={userStatuses}
          setSelectedUser={setSelectedUser}
          mobile={mobile}
          onOpenSidebar={onOpenSidebar}
        />

        <section className="flex min-h-0 flex-1 flex-col justify-between">
          {selectedUser ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <ChatMessages
                selectedUser={selectedUser}
                socketRef={socketRef}
                clearNotification={clearNotification}
              />

              <ChatInput
                selectedUser={selectedUser}
                socketRef={socketRef}
              />
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-gray-500 dark:text-gray-400">
              <div>
                Select a user or group to start chatting.
              </div>

              {mobile && onOpenSidebar ? (
                <button
                  className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded hover:bg-gray-800 dark:hover:bg-gray-200"
                  onClick={onOpenSidebar}
                >
                  Open chats
                </button>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
