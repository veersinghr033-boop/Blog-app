"use client";
import { message, Button } from "antd";
import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
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
    }, [selectedUser ])

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
            className="border-t border-gray-300 bg-white px-6 py-4"
        >
            <div className="flex gap-3">
                <input
                    value={messageText}
                    onChange={handleTyping}
                    className="flex-1 rounded-full border border-gray-300 px-5 py-3"
                    placeholder={
                        selectedUser?.type === "group"
                            ? "Send message to group..."
                            : "Type a message..."
                    }
                />

                <Button
                    htmlType="submit"
                    disabled={!messageText.trim()}
                    loading={sendMutation.isPending}
                    className="rounded-2xl! bg-black! px-6! py-5! text-white! disabled:opacity-50!"
                >
                    Send
                </Button>
            </div>
        </form>
    );
}