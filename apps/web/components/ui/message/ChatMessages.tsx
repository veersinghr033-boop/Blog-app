"use client";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { useQuery, Mutation } from "@tanstack/react-query";
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

  readBy: string[];
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

    const markAsRead = async () => {
      try {
        if (selectedUser.type === "group") {
          await api.put("/read", {
            groupId: selectedUser.id,
          });
        } else {
          await api.put("/read", {
            receiverId: selectedUser.id,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };
    markAsRead();

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
    const readHandler = ({ chatId, readBy }: { chatId: string; readBy: string }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const msgChatId = msg.chatId?._id || msg.chatId;
          const sameChat = msgChatId && String(msgChatId) === String(chatId);
          console.log(sameChat ,"ok" , msgChatId)
          if (sameChat && msg.senderId._id === userId) {
            return { ...msg, isRead: true, readBy: Array.isArray(msg.readBy) ? Array.from(new Set([...(msg.readBy || []), readBy])) : [readBy] };
          }

          return msg;
        }),
      );
    };

    socketRef.current.on("messagesRead", readHandler);




    socketRef.current.on("receiveMessage", privateHandler);
    socketRef.current.on("userTyping", typingHandler);
    socketRef.current.on("userStopTyping", stopTypingHandler);

    return () => {
      socketRef.current?.off("receiveMessage", privateHandler);
      socketRef.current?.off("userTyping", typingHandler);
      socketRef.current?.off("userStopTyping", stopTypingHandler);
      socketRef.current.off(
        "messagesRead",
        readHandler
      );
    };
  }, [selectedUser, userId]);
  // useEffect(() => {
  //   if (!selectedUser )return;

  //   const markAsRead = async () => {
  //     try {
  //       if (selectedUser.type === "group") {
  //         await api.put("/read", {
  //           groupId: selectedUser.id,
  //         });
  //       } else {
  //         await api.put("/read", {
  //           receiverId: selectedUser.id,
  //         });
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   markAsRead();
  // }, [selectedUser, messages]);
  return (
    <>
      <Virtuoso
        style={{ height: "100%" }}
        data={messages}
        followOutput="smooth"
        itemContent={(index, item) => {
          const isMine = item.senderId._id === userId;

          return (
            <div
              className={`flex flex-col gap-1 mx-4 py-1.5 ${isMine ? "items-end" : "items-start"
                }`}
            >
              <div className="text-xs text-gray-400 px-1">
                {isMine ? "You " : item.senderId.userName}{" "}
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div
                className={`max-w-[70%] rounded-2xl px-5 py-2 ${isMine ? "bg-blue-500 text-white" : "bg-gray-100 text-black"
                  }`}
              >
                {item.message}
              </div>
              {isMine && (
                <div className="text-[11px] text-gray-400 mt-1">
                  {item.isRead ? "Seen" : "Send"}
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
