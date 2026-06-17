"use client";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { useQuery } from "@tanstack/react-query";
import { CheckCircleOutlined,EyeOutlined  } from "@ant-design/icons"
import api from "@/utills/axios";
interface Props {
  socketRef: any;
  selectedUser: any;
  clearNotification: any;
}
interface MessageType {
  _id: string;

  chatId?: any;

  senderId: {
    _id: string;
    userName: string;
  };

  receiverId?: string;

  groupId?: string;

  message: string;

  timestamp: string;

  isRead: boolean;

  readBy: { _id: string; userName: string }[];
}

export default function ChatMessages({
  socketRef,
  selectedUser,
  clearNotification,
}: Props) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const currentRoomRef = useRef<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
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

  const selectedChatId = selectedUser?.id || selectedUser?._id;

  useEffect(() => {
    if (!selectedChatId) return;
    clearNotification(selectedChatId);
  }, [selectedChatId, messages]);

  useEffect(() => {
    if (!selectedUser || !userId || !socketRef.current) return;

    const buildCurrentChatKey = () => {
      if (selectedUser.type === "group") {
        return selectedUser.id;
      }

      return [userId, selectedUser.id].sort().join("_");
    };

    const typingHandler = ({ chatId }: { chatId: string }) => {
      const currentChatKey = buildCurrentChatKey();

      if (chatId === currentChatKey) {
        setTypingUsers((prev) => ({
          ...prev,
          [currentChatKey]: true,
        }));
      }
    };

    const stopTypingHandler = ({ chatId }: { chatId: string }) => {
      const currentChatKey = buildCurrentChatKey();

      if (chatId === currentChatKey) {
        setTypingUsers((prev) => ({
          ...prev,
          [currentChatKey]: false,
        }));
      }
    };

    if (selectedUser.type === "group") {
      socketRef.current.emit("joinGroup", selectedUser.id);

      const groupHandler = (msg: MessageType) => {
        if (msg.groupId === selectedUser.id) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      socketRef.current.on("receiveGroupMessage", groupHandler);
      socketRef.current.on("userTyping", typingHandler);
      socketRef.current.on("userStopTyping", stopTypingHandler);

      return () => {
        socketRef.current?.off("receiveGroupMessage", groupHandler);
        socketRef.current?.off("userTyping", typingHandler);
        socketRef.current?.off("userStopTyping", stopTypingHandler);
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
    socketRef.current.on("userTyping", typingHandler);
    socketRef.current.on("userStopTyping", stopTypingHandler);

    return () => {
      socketRef.current?.off("receiveMessage", privateHandler);
      socketRef.current?.off("userTyping", typingHandler);
      socketRef.current?.off("userStopTyping", stopTypingHandler);
    };
  }, [selectedUser, userId]);
  useEffect(() => {
    if (!socketRef.current) return;

    const readHandler = (data: any) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (!data.messageIds.includes(msg._id)) {
            return msg;
          }

          return {
            ...msg,
            readBy: msg.readBy.some((user) => user._id === data.reader._id)
              ? msg.readBy
              : [...msg.readBy, data.reader],
          };
        }),
      );
    };

    socketRef.current.on("messagesRead", readHandler);

    return () => {
      socketRef.current.off("messagesRead", readHandler);
    };
  }, []);
  useEffect(() => {
    if (!selectedUser || !socketRef.current || !messages.length) return;

    const chatId = messages[0]?.chatId;

    if (!chatId) return;

    socketRef.current.emit("readMessages", {
      chatId,
      userId,
    });
  }, [selectedUser, messages]);

  return (
    <>
      <Virtuoso
        style={{ height: "100%" }}
        data={messages}
        followOutput="smooth"
        itemContent={(index, item) => {
          const isMine = item.senderId._id === userId;
          const isReadByReceiver = item.readBy.some(
            (user) => user._id !== userId,
          );
          const groupReadUsers = item.readBy.filter(
            (user) => user._id !== item.senderId._id,
          );
          return (
            <div
              className={`flex flex-col gap-1 mx-4 py-1.5 ${
                isMine ? "items-end" : "items-start"
              }`}
            >
              <div className="text-xs text-gray-400 px-1">
                {isMine ? null : item.senderId.userName}{" "}
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div
                className={`max-w-[70%] rounded-2xl wrap-break-word px-5 py-2 ${
                  isMine ? "bg-blue-500 text-white" : "bg-gray-100 text-black"
                }`}
              >
                {item.message}
              </div>
              {isMine && selectedUser.type !== "group" && (
                <div className="text-[11px] text-gray-400 " title={isReadByReceiver ? "Seen" : "Sent"} >
                  {isReadByReceiver ? <EyeOutlined /> : <CheckCircleOutlined />}
                </div>
              )}
              {isMine && selectedUser.type === "group" && (
                <div
                  className="text-[11px] text-gray-400  "
                  title={
                    groupReadUsers.length
                      ? `Seen by: ${groupReadUsers.map((user) => user.userName).join(", ")}`
                      : "Sent"
                  }
                >
                  {groupReadUsers.length ? <EyeOutlined/> : <CheckCircleOutlined/>}
                </div>
              )}
            </div>
          );
        }}
      />

      {(() => {
        const currentChatKey =
          selectedUser.type === "group"
            ? selectedUser.id
            : [userId, selectedUser.id].sort().join("_");

        return typingUsers[currentChatKey] ? (
          <div className="text-xs text-blue-500 animate-pulse p-1">
            typing...
          </div>
        ) : null;
      })()}
    </>
  );
}
