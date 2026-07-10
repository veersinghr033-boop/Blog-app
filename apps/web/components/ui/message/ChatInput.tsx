"use client";
import { toast } from "sonner"; 
import { useEffect, useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import ChatEditor from "@/components/lexical/ChatEditor";
import { Send } from "lucide-react";

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
    const [messageText, setMessageText] = useState<any>(null);
    const [editorKey, setEditorKey] = useState(0);

    onSuccess: () => {
        setMessageText(null);
        setEditorKey((prev) => prev + 1);
    };    useEffect(() => {
        setMessageText("")
    }, [selectedUser])

    const sendMutation = useMutation({
        mutationFn: async (payload: any) => {
            return api.post("/chat", payload);
        },
        onSuccess: () => {
            setMessageText(null);
            setEditorKey((prev) => prev + 1);
        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to delete message",
            );
        },
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();

        sendMessage();
    };
    const sendMessage = () => {
        if (!messageText || !selectedUser || !userId) return;
        console.log("messageText:", messageText);
        console.log(messageText);

        console.log("Sending:", messageText);

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
    const handleMessageChange = (json: any) => {
        setMessageText(json);


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
                <ChatEditor
                    key={editorKey}
                    value={messageText}
                    onChange={handleMessageChange}
                    onEnter={sendMessage}
                    placeholder={
                        selectedUser?.type === "group"
                            ? "Send message to group..."
                            : "Type a message..."
                    }
                />
                <button
                    type="submit"
                    disabled={!messageText || sendMutation.isPending}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
                >
                    {sendMutation.isPending ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send size={22} />
                    )}
                </button>
            </div>
        </form>
    );
}