"use client"

import { Layout } from "antd"
import { useState, useRef, useEffect } from "react"
import MessageChat from "./messageChat"
import { useQuery } from "@tanstack/react-query"
import api from "@/utills/axios"
import { message } from "antd"
import { useAppSelector } from "@/lib/store/hooks"
import { io } from "socket.io-client";


interface UserType {
    id: string
    name: string
    email: string
    role: string
    status: string
    joined: string
}

interface User {
    _id: string;
    username: string;
    updatedAt?: string | null;
}

function Message() {
    const [search, setSearch] = useState("")
    const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
    const socketRef = useRef<any>(null);
    const [sortedUsers, setSortedUsers] = useState<User[]>([]);

    const { Sider, Content } = Layout

    const userId = useAppSelector((state) => state.auth.user?.userName)
    const userId2 = useAppSelector((state) => state.auth.user?.id)

    const {
        data: users = [],
        isLoading,
        isError,
        error,
    } = useQuery<UserType[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await api.get("/users")

            return response.data.map((user: any) => ({
                id: user._id,
                name: user.userName,
                role: user.role,
            }))
        },
    })

    useEffect(() => {
        if (isError) {
            console.error("Error fetching users:", error)
            message.error("Failed to fetch users")
        }
    }, [isError, error])

    useEffect(() => {
        if (!userId2) return;

        const socket = io("http://localhost:5050");

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected:", socket.id);

            socket.emit("userOnline", userId2);
        });



        socket.on("userStatus", ({ userId, status }: { userId: string; status: string }) => {
            setUserStatuses((prev: any) => ({
                ...prev,
                [userId]: status,
            }));
        });
        socket.on("disconnect", () => {
            console.log(" Disconnected");
        });

        return () => {
            socket.disconnect();
        };
    }, [userId2]);

    useEffect(() => {
        if (!socketRef.current || !userId2) return;

        let timeout: NodeJS.Timeout;
        const setAway = () => {
            socketRef.current.emit("userAway", userId2);
        };
        const setOffline = () => {
            socketRef.current.emit("userOffline", userId2);
        };
        const resetTimer = () => {
            clearTimeout(timeout);
            socketRef.current.emit("userOnline", userId2);
            timeout = setTimeout(setAway, 3 * 60 * 1000);
            timeout = setTimeout(setOffline, 20 * 60 * 1000);
        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);
        window.addEventListener("click", resetTimer);

        const handleHidden = () => {
            if (document.hidden) {
                socketRef.current.emit("userAway", userId2);
            } else {
                socketRef.current.emit("userOnline", userId2);
            }
        };
        document.addEventListener("visibilitychange", handleHidden);

        const handleUnload = () => {
            if (!socketRef.current) return;
            socketRef.current.emit("userOffline", userId2);
            socketRef.current.disconnect();
        };

        window.addEventListener("beforeunload", handleUnload);
        window.addEventListener("pagehide", handleUnload);
        resetTimer();
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
            window.removeEventListener("click", resetTimer);
            document.removeEventListener("visibilitychange", handleHidden);
            window.removeEventListener("beforeunload", handleUnload);
            window.removeEventListener("pagehide", handleUnload);
        };

    }, [userId]);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelectUser = (user: UserType) => {
        setSelectedUser(user);
    };

    // console.log(userStatuses);


    return (
        <Layout className=" p-4 md:p-0">
            <Sider className=" min-h-[calc(100vh-115px)] rounded bg-white!  shadow-sm border border-gray-200 " width={"256px"}>
                <div className="px-6 py-5 border-b border-gray-300">
                    <div className="text-base font-semibold capitalize">
                        {`Welcome, ${userId || "User"}`}
                    </div>
                </div>
                <div className="px-4 py-4 flex justify-between">
                    <input
                        type="text"
                        placeholder="Search user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-slate-400 px-2 py-1 rounded"
                    />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredUsers.map((user) => {
                        const status = userStatuses[user.id] || "offline";

                        return (
                            <button
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                className={`w-full text-left px-6 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50 ${selectedUser?.id === user.id ? "bg-slate-100" : "bg-white"
                                    }`}
                            >
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-black text-white font-semibold uppercase">
                                    {user.name?.[0] || "U"}

                                    <span
                                        className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${status === "online"
                                            ? "bg-green-500"
                                            : status === "away"
                                                ? "bg-yellow-400"
                                                : "bg-red-400"
                                            }`}
                                    />
                                </div>

                                <div className="flex-1">
                                    <div className="font-medium capitalize">{user.name}</div>

                                    <div className="text-sm text-slate-500 capitalize">
                                        {`( ${user.role} )`}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Sider>

            <Content>
                <MessageChat selectedUser={selectedUser} />
            </Content>

        </Layout >
    )
}

export default Message
