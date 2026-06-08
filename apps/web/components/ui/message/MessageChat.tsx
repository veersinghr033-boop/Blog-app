"use client";

import { Layout, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Virtuoso } from "react-virtuoso";
import { useMutation, useQuery } from "@tanstack/react-query";

import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";

interface Message {
    senderId: string;
    receiverId: string;
    message: string;
    timestamp: string;
}

export default function MessageChat({ selectedUser }: any) {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});

    const socketRef = useRef<any>(null);
    const currentRoomRef = useRef<string | null>(null);

    const userId = useAppSelector((state) => state.auth.user?.id);

    const { data } = useQuery<Message[]>({
        queryKey: ["chatMessages", selectedUser?.id],
        queryFn: async () => {
            if (!selectedUser) return [];
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
        socketRef.current = io("http://localhost:5050");
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
        const room = [userId, selectedUser.id].sort().join("_");
        if (currentRoomRef.current) {
            socketRef.current.emit("leaveRoom", currentRoomRef.current);
        }
        socketRef.current.emit("joinRoom", {
            user1: userId,
            user2: selectedUser.id,
        });
        currentRoomRef.current = room;
        const handler = (msg: Message) => {
            const msgRoom = [msg.senderId, msg.receiverId].sort().join("_");
            if (room === msgRoom) {
                setMessages((prev) => [...prev, msg]);
            }
        };
        socketRef.current.on("receiveMessage", handler);
        return () => {
            socketRef.current.off("receiveMessage", handler);
        };
    }, [selectedUser, userId]);

    const sendMutation = useMutation({
        mutationFn: async (msg: Message) => {
            return api.post("/chat", msg);
        },
        onSuccess: () => {
            setMessageText("");
        },
        onError: () => {
            message.error("Failed to send");
        },
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageText.trim() || !selectedUser || !userId) return;

        sendMutation.mutate({
            senderId: userId,
            receiverId: selectedUser.id,
            message: messageText,
            timestamp: new Date().toISOString(),
        });
    };

    return (
        <Layout className="  md:p-0 shadow-lg! border! border-gray-200">
                    <div className=" h-[calc(100vh-115px)] rounded bg-white ">
                        <header className="flex items-center border-b border-gray-300 bg-white px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-black text-white font-semibold uppercase relative">
                                    {selectedUser?.name?.[0] || "U"}
                                    <span
                                        className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${userStatuses[selectedUser?.id || ""] === "online"
                                                ? "bg-green-500"
                                                : userStatuses[selectedUser?.id || ""] === "away"
                                                    ? "bg-yellow-400"
                                                    : "bg-red-400"
                                            }`}
                                    />
                                </div>
                                <div className="text-base font-semibold capitalize">
                                    {selectedUser ? selectedUser.name : "Open a chat"}
                                </div>
                            </div>
                        </header>
                        <section className="flex flex-col justify-between ">
                            {selectedUser ? (
                                <div className="flex flex-col h-[calc(100vh-180px)]">
                                    <Virtuoso
                                        style={{ height: "100%" }}
                                        data={messages}
                                        followOutput="smooth"
                                        itemContent={(index, item: Message) => {
                                            const isMine = item.senderId === userId;
        
                                            return (
                                                <div
                                                    className={`  flex flex-col gap-1 mx-4 py-1.5 ${isMine ? "self-end items-end" : "self-start items-start"}`}
                                                >
                                                    <div
                                                        className={`inline-block max-w-[70%] break-words rounded-2xl px-5 py-2 ${isMine
                                                            ? "bg-blue-500 text-white shadow"
                                                            : "bg-white text-black shadow"
                                                            }`}
                                                    >
                                                        {item.message}
                                                    </div>
        
                                                    <div className="text-xs text-gray-400 mb-2.5 px-1">
                                                        {new Date(item.timestamp).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
        
                                    <form
                                        className="border-t border-gray-300 bg-white px-6 py-4"
                                        onSubmit={handleSend}
                                    >
                                        <div className="flex gap-3">
                                            <input
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                className="flex-1 rounded-full border border-slate-300 px-5 py-3 focus:border-black focus:outline-none"
                                                placeholder="Type a message..."
                                            />
                                            <button
                                                type="submit"
                                                className="rounded-2xl bg-black px-6 py-3 text-white  disabled:opacity-50"
                                                disabled={!messageText.trim()}
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">
                                    Select a user to start chatting.
                                </div>
                            )}
                        </section>  
                    </div>
                </Layout>
    );
}
