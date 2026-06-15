"use client";

import { Layout } from "antd";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import MessageHeader from "./MessageHeader";

export default function MessageChat({
  selectedUser,
  setSelectedUser,
  clearNotification,
}: any) {
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
  const socketRef = useRef<any>(null);
  useEffect(() => {
    const socket = io("http://localhost:5050");
    socketRef.current = socket;
    socketRef.current.on("userStatus", ({ userId, status }: any) => {
      setUserStatuses((prev) => ({
        ...prev,
        [userId]: status,
      }));
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <Layout className="md:p-0 shadow-lg border border-gray-200">
      <div className="h-[calc(100vh-115px)] rounded bg-white">
        <MessageHeader
          selectedUser={selectedUser}
          userStatuses={userStatuses}
          setSelectedUser={setSelectedUser}
        />
        <section className="flex flex-col justify-between">
          {selectedUser ? (
            <div className="flex flex-col h-[calc(100vh-180px)]">
              <ChatMessages
                selectedUser={selectedUser}
                socketRef={socketRef}
                clearNotification={clearNotification}
              />

              <ChatInput selectedUser={selectedUser} socketRef={socketRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a user or group to start chatting.
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
