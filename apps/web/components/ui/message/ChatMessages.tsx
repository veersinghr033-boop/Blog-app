
"use client";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  CheckCircleOutlined,
  EllipsisOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "@/utills/axios";
import { message, Button, Popover, Tooltip } from "antd";

interface SelectedUser {
  id?: string;
  _id?: string;
  type?: "group" | string;
}

interface Props {
  socketRef: any;
  selectedUser: SelectedUser;
  clearNotification: (chatId: string) => void;
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

interface MessagePage {
  messages: MessageType[];
  hasMore: boolean;
  nextCursor: string | null;
}

export default function ChatMessages({
  socketRef,
  selectedUser,
  clearNotification,
}: Props) {
  const currentRoomRef = useRef<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const userId = useAppSelector((state) => state.auth.user?.id);
  const virtuosoRef = useRef<any>(null);
  const selectedChatId = selectedUser.id || selectedUser._id || "";
  const firstItemIndex = useRef(100000);
  const queryClient = useQueryClient();
  const lastReadChatRef = useRef<string | null>(null);
  const { data, fetchPreviousPage, hasPreviousPage, isFetchingPreviousPage } =
    useInfiniteQuery<MessagePage>({
      queryKey: ["chatMessages", selectedUser.type, selectedChatId],

      queryFn: async ({ pageParam }) => {
        if (!selectedChatId) {
          return {
            messages: [],
            hasMore: false,
            nextCursor: null,
          };
        }

        const before = pageParam ? `?before=${pageParam}` : "";

        const url =
          selectedUser.type === "group"
            ? `/chat/group-messages/${selectedChatId}${before}`
            : `/chat/${selectedChatId}${before}`;

        const res = await api.get(url);

        return res.data;
      },

      initialPageParam: null,

      getNextPageParam: (lastPage: MessagePage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,

      getPreviousPageParam: (firstPage: MessagePage) =>
        firstPage.hasMore ? firstPage.nextCursor : undefined,

      staleTime: Infinity,
      gcTime: 1000 * 60 * 30,

      enabled: !!selectedChatId,
    });

  const messages = useMemo(
    () => data?.pages.flatMap((page) => page.messages) ?? [],
    [data?.pages],
  );

  useEffect(() => {
    if (!isFetchingPreviousPage && (data?.pages?.length ?? 0) > 1) {
      firstItemIndex.current -= 20;
    }
  }, [data?.pages?.length ?? 0]);
  useEffect(() => {
    if (!selectedChatId) return;
    clearNotification(selectedChatId);
  }, [selectedChatId, clearNotification]);

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

    const messagesReadHandler = (payload: any) => {
      queryClient.setQueryData(
        ["chatMessages", selectedUser.type, selectedChatId],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              messages: page.messages.map((msg: MessageType) => {
                if (!payload.messageIds.includes(msg._id)) {
                  return msg;
                }

                const exists = msg.readBy.some(
                  (u) => u._id === payload.reader._id
                );

                if (exists) return msg;

                return {
                  ...msg,
                  readBy: [...msg.readBy, payload.reader],
                };
              }),
            })),
          };
        }
      );
    };
    if (selectedUser.type === "group") {
      socketRef.current.emit("joinGroup", selectedChatId);

      const groupHandler = (msg: MessageType) => {
        if (msg.groupId !== selectedChatId) return;

        queryClient.setQueryData(
          ["chatMessages", selectedUser.type, selectedChatId],
          (oldData: any) => {
            if (!oldData) return oldData;

            const pages = [...oldData.pages];

            pages[pages.length - 1] = {
              ...pages[pages.length - 1],
              messages: [...pages[pages.length - 1].messages, msg],
            };

            return {
              ...oldData,
              pages,
            };
          },
        );
      };

      socketRef.current.on("receiveGroupMessage", groupHandler);
      socketRef.current.on("userTyping", typingHandler);
      socketRef.current.on("userStopTyping", stopTypingHandler);
      socketRef.current.on("messagesRead", messagesReadHandler);

      return () => {
        socketRef.current?.off("receiveGroupMessage", groupHandler);
        socketRef.current?.off("userTyping", typingHandler);
        socketRef.current?.off("userStopTyping", stopTypingHandler);
        socketRef.current?.off("messagesRead", messagesReadHandler);
      };
    }

    const room = [userId, selectedChatId].sort().join("_");

    if (currentRoomRef.current) {
      socketRef.current.emit("leaveRoom", currentRoomRef.current);
    }

    socketRef.current.emit("joinRoom", {
      user1: userId,
      user2: selectedChatId,
    });

    currentRoomRef.current = room;

    const privateHandler = (msg: MessageType) => {
      const msgRoom = [msg.senderId._id, msg.receiverId].sort().join("_");

      if (room !== msgRoom) return;

      queryClient.setQueryData(
        ["chatMessages", selectedUser.type, selectedChatId],
        (oldData: any) => {
          if (!oldData) return oldData;

          const pages = [...oldData.pages];

          pages[pages.length - 1] = {
            ...pages[pages.length - 1],
            messages: [...pages[pages.length - 1].messages, msg],
          };

          return {
            ...oldData,
            pages,
          };
        },
      );
    };
    socketRef.current.on("receiveMessage", privateHandler);
    socketRef.current.on("userTyping", typingHandler);
    socketRef.current.on("userStopTyping", stopTypingHandler);
    socketRef.current.on("messagesRead", messagesReadHandler);

    return () => {
      socketRef.current?.off("receiveMessage", privateHandler);
      socketRef.current?.off("userTyping", typingHandler);
      socketRef.current?.off("userStopTyping", stopTypingHandler);
      socketRef.current?.off("messagesRead", messagesReadHandler);
    };
  }, [selectedUser?.type, selectedChatId, userId]);

  useEffect(() => {
    if (!selectedUser || !socketRef.current || !messages.length) return;

    const chatId = messages[0]?.chatId;

    if (!chatId) return;

    const readKey = `${selectedChatId}:${messages.length}:${chatId}`;

    if (lastReadChatRef.current === readKey) return;

    lastReadChatRef.current = readKey;

    socketRef.current.emit("readMessages", {
      chatId,
      userId,
    });
  }, [selectedUser, selectedChatId, messages.length, messages[0]?.chatId, userId]);

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return api.delete(`/chat/message/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", selectedUser.type, selectedChatId],
      });
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Failed to delete message",
      );
    },
  });

  const deleteMessageById = (messageId: string) => {
    deleteMessageMutation.mutate(messageId);
  };
  const firstLoadRef = useRef(true);

  useEffect(() => {
    if (!messages.length) return;

    if (firstLoadRef.current) {
      firstLoadRef.current = false;

      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        behavior: "auto",
      });
    }
  }, [messages.length]);
  useEffect(() => {
    if (!selectedChatId) return;

    firstLoadRef.current = true;
    firstItemIndex.current = 100000;
    virtuosoRef.current = null;
  }, [selectedChatId]);
  return (
    <>
      <div className="min-h-0 flex-1 overflow-hidden">
        <Virtuoso
          style={{ height: "80vh" }}
          ref={virtuosoRef}
          data={messages}
          firstItemIndex={firstItemIndex.current}
          computeItemKey={(_, item) => item._id}
          followOutput="smooth"
          startReached={() => {
            if (hasPreviousPage && !isFetchingPreviousPage) {
              fetchPreviousPage();
            }
          }}
          components={{
            Header: () =>
              isFetchingPreviousPage ? (
                <div className="text-center py-2">
                  Loading older messages...
                </div>
              ) : null,
          }}
          itemContent={(_, item) => {
            const isMine = item.senderId?._id === userId;
            const isReadByReceiver = item.readBy.some(
              (user) => user._id !== userId,
            );
            const groupReadUsers = item.readBy.filter(
              (user) => user._id !== item.senderId?._id,
            );

            return (
              <div
                className={`flex flex-col gap-1 mx-2 py-1.5 sm:mx-4 ${isMine ? "items-end" : "items-start"
                  }`}
              >
                <div className="px-1 text-xs text-gray-400">
                  {isMine ? null : item.senderId?.userName}{" "}
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMine && (
                    <Popover
                      content={
                        <div>
                          <Button
                            type="text"
                            danger
                            size="small"
                            onClick={() => deleteMessageById(item._id)}
                            loading={deleteMessageMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      }
                      trigger="click"
                      placement="bottomRight"
                    >
                      <Button type="text" size="small">
                        <EllipsisOutlined />
                      </Button>
                    </Popover>
                  )}
                </div>

                <div
                  className={`h-full max-w-[85%] wrap-break-word rounded-2xl px-4 py-2 sm:max-w-[70%] sm:px-5 ${isMine ? "bg-blue-500 text-white" : "bg-gray-100 text-black"
                    }`}
                >
                  {item.message}
                </div>

                {isMine && selectedUser.type !== "group" && (
                  <Tooltip
                    title={isReadByReceiver ? "Seen" : "Send"}
                    color="white"
                  >
                    <div className="text-[11px] text-gray-400">
                      {isReadByReceiver ? (
                        <EyeOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )}
                    </div>
                  </Tooltip>
                )}

                {isMine && selectedUser.type === "group" && (
                  <Tooltip
                    title={
                      groupReadUsers.length ? (
                        <div>
                          {"Seen by :"}
                          {groupReadUsers.map((user: any) => (
                            <div key={user.id} className="text-gray-600">
                              {" "}
                              {user.userName}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "Send"
                      )
                    }
                    color="white"
                  >
                    <div className="text-[11px] text-gray-400">
                      {groupReadUsers.length ? (
                        <EyeOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )}
                    </div>
                  </Tooltip>
                )}
              </div>
            );
          }}
        />
      </div>

      {(() => {
        const currentChatKey =
          selectedUser.type === "group"
            ? selectedChatId
            : userId
              ? [userId, selectedChatId].sort().join("_")
              : selectedChatId;

        return typingUsers[currentChatKey] ? (
          <div className="p-1 text-xs text-blue-500 animate-pulse">
            typing...
          </div>
        ) : null;
      })()}
    </>
  );
}
