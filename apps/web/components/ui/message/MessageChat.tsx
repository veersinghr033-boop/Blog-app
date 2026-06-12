"use client";

import { Layout, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Virtuoso } from "react-virtuoso";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import ViewGroup from "./ViewGroup";
import { getSocket } from "@/utills/socket";
import useUserStatus from "./useUserStatus";

interface MessageType {
  senderId: { _id: string; userName: string };
  receiverId?: string;
  groupId?: string;
  message: string;
  timestamp: string;
}

export default function MessageChat({
  selectedUser,
  setSelectedUser,
  clearNotification,
}: any) {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
  const socketRef = useRef<any>(null);
  const currentRoomRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectGroup, setSelectGroup] = useState<String>("");
  const userId = useAppSelector((state) => state.auth.user?.id);

  const { data } = useQuery<MessageType[]>({
    queryKey: ["chatMessages", selectedUser?._id || selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];
      if (selectedUser.type === "group") {
        const res = await api.get(`/chat/group-messages/${selectedUser.id}`);

        return res.data;
      }
      const res = await api.get(`/chat/${selectedUser.id}`);

      return res.data;
    },
    enabled: !!selectedUser,
  });

  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  useEffect(() => {
    const socket = io("http://localhost:5050");
    socketRef.current = socket
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

  useEffect(() => {
    if (!selectedUser || !userId || !socketRef.current) return;

    if (selectedUser.type === "group") {
      socketRef.current.emit("joinGroup", selectedUser.id);

      const groupHandler = (msg: MessageType) => {
        // console.log("Message", msg);
        if (msg.groupId === selectedUser.id) {

          setMessages((prev) => [...prev, msg]);

        }
      };



      socketRef.current.on("receiveGroupMessage", groupHandler);

      return () => {
        socketRef.current.off("receiveGroupMessage", groupHandler);
      };
    }

    const room = [userId, selectedUser.id].sort().join("_");

    if (currentRoomRef.current) {
      socketRef.current.emit("leaveRoom", currentRoomRef.current);
    }

    socketRef.current.emit("joinRoom", {
      user1: userId,
      user2: selectedUser.id,
    });

    currentRoomRef.current = room;

    const privateHandler = (msg: MessageType) => {
      const msgRoom = [msg.senderId._id, msg.receiverId].sort().join("_");

      if (room === msgRoom) {
        setMessages((prev) => [...prev, msg]);

      }
    };

    socketRef.current.on("receiveMessage", privateHandler);

    return () => {
      socketRef.current.off("receiveMessage", privateHandler);
    };
  }, [selectedUser, userId]);

  const selectedChatId = selectedUser?.id || selectedUser?._id;

  useEffect(() => {
    if (!selectedChatId) return;
    clearNotification(selectedChatId);
  }, [selectedChatId, messages]);
  const sendMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post("/chat", payload);
    },
    onSuccess: () => {
      setMessageText("");
    },
    onError: () => {
      message.error("Failed to send message");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedUser || !userId) return;

    if (selectedUser.type === "group") {
      sendMutation.mutate({
        senderId: userId,
        groupId: selectedUser.id,
        message: messageText,
        timestamp: new Date().toISOString(),
      });

      return;
    }

    sendMutation.mutate({
      senderId: userId,
      receiverId: selectedUser.id,
      message: messageText,
      timestamp: new Date().toISOString(),
    });
  };
  const handleView = () => {
    if (selectedUser?.type === "group") {
      setOpen(true);
      setSelectGroup(selectedUser.id);
    } else {
      setOpen(false);
    }
  };

  return (
    <Layout className="md:p-0 shadow-lg border border-gray-200">
      <div className="h-[calc(100vh-115px)] rounded bg-white">
        <header className="flex items-center border-b border-gray-300 bg-white px-6 py-3">
          <div className="flex items-center gap-4" onClick={handleView}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white font-semibold uppercase relative">
              {selectedUser?.type === "group" ? (
                <TeamOutlined />
              ) : (
                selectedUser?.name?.[0] || "U"
              )}

              {selectedUser?.type !== "group" && (
                <span
                  className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${userStatuses[selectedUser?.id || ""] === "online" ? "bg-green-500" : userStatuses[selectedUser?.id || ""] === "away" ? "bg-yellow-400" : "bg-red-400"}`}
                />
              )}
            </div>

            <div>
              <div className="text-base font-semibold capitalize">
                {selectedUser ? selectedUser.name : "Open a chat"}
              </div>

              {
                <div className="text-xs text-gray-500">
                  {userStatuses[selectedUser?.id || ""] ||
                    selectedUser?.type == "group"
                    ? "Group"
                    : "offline"}
                </div>
              }
            </div>
          </div>
        </header>

        <section className="flex flex-col justify-between">
          {selectedUser ? (
            <div className="flex flex-col h-[calc(100vh-180px)]">
              <Virtuoso
                style={{ height: "100%" }}
                data={messages}
                followOutput="smooth"
                itemContent={(index, item) => {
                  const isMine = item.senderId._id === userId;

                  return (
                    <div
                      className={`flex flex-col gap-1 mx-4 py-1.5 ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div className="text-xs text-gray-400 px-1">
                        {isMine ? "You " : item.senderId.userName}{" "}
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div
                        className={`max-w-[70%] wrap-break-word rounded-2xl px-5 py-2 ${isMine
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-black"
                          }`}
                      >
                        {item.message}
                      </div>
                    </div>
                  );
                }}
              />

              <form
                onSubmit={handleSend}
                className="border-t border-gray-300 bg-white px-6 py-4"
              >
                <div className="flex gap-3">
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 rounded-full border border-gray-300 px-5 py-3 focus:border-black focus:outline-none"
                    placeholder={
                      selectedUser?.type === "group"
                        ? "Send message to group..."
                        : "Type a message..."
                    }
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="rounded-2xl bg-black px-6 py-3 text-white disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a user or group to start chatting.
            </div>
          )}
        </section>
      </div>
      <ViewGroup
        open={open}
        onClose={() => setOpen(false)}
        Groups={selectGroup}
        SelectedUser={setSelectedUser}
      />
    </Layout>
  );
}
