"use client";
import { message } from "antd";
import { useEffect, useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
interface Props {

    socketRef: any
    selectedUser: any;
}

export default function ChatInput({
    socketRef,
    selectedUser,
}: Props) {
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const userId = useAppSelector((state) => state.auth.user?.id);
    const [messageText, setMessageText] = useState("");
    useEffect(() => {
        setMessageText("")
    }, [selectedUser])

    const sendMutation = useMutation({
        mutationFn: async (payload: any) => {
            return api.post("/chat", payload);
        },
        onSuccess: () => {
            setMessageText("");
        },
        onError: (error: any) => {
            message.error(
                error?.response?.data?.message || "Failed to delete message",
            );
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

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessageText(value);

        if (!socketRef.current || !selectedUser || !userId) return;

        const typingPayload = selectedUser.type === "group"
            ? { senderId: userId, groupId: selectedUser.id }
            : { senderId: userId, receiverId: selectedUser.id };

        socketRef.current.emit("typing", typingPayload);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            const stopTypingPayload = selectedUser.type === "group"
                ? { senderId: userId, groupId: selectedUser.id }
                : { senderId: userId, receiverId: selectedUser.id };

            socketRef.current?.emit("stopTyping", stopTypingPayload);
        }, 1500);
    };
    return (
        <form
            onSubmit={handleSend}
            className="border-t border-gray-300 bg-white p-3 sm:px-4 sm:py-3.5"
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                <input
                    value={messageText}
                    onChange={handleTyping}
                    className="w-full flex-1 rounded-full border border-gray-300 px-4 py-3 sm:px-5"
                    placeholder={
                        selectedUser?.type === "group"
                            ? "Send message to group..."
                            : "Type a message..."
                    }
                />

                <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {sendMutation.isPending ? "Sending..." : "Send"}
                </button>
            </div>
        </form>
    );
}