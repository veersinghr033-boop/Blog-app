"use client";

import { Layout, message } from "antd";
import { useEffect, useState ,useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import useUserStatus from "./useUserStatus";

interface UserType {
    id: string;
    name: string;
    role: string;
}

export default function UserSidebar({ selectedUser, setSelectedUser }: any) {
    const [search, setSearch] = useState("");
    const socketRef = useRef<any>(null);
    const [sortedUsers, setSortedUsers] = useState<UserType[]>([]);
    const userName = useAppSelector((state) => state.auth.user?.userName);

    const userId = useAppSelector((state) => state.auth.user?.id);

    const { statuses: userStatuses } = useUserStatus(userId);

    
    useEffect(() => {
        if (!userId) return;

        const socket = io("http://localhost:5050");

        socketRef.current = socket;

        socket.emit("userOnline", userId);

        socket.on("sortedUsers", (users) => {

            setSortedUsers(users);
        });
        return () => {
            socket.disconnect();
        };
    }, [ userId ]);
    // console.log("Sorted", sortedUsers)

    const {
        data: users = [],
        isError,
        error,
    } = useQuery<UserType[]>({
        queryKey: ["users"],

        queryFn: async () => {
            const res = await api.get("/users");

            return res.data.map((user: any) => ({
                id: user._id,
                name: user.userName,
                role: user.role,
            }));
        },
    });

    useEffect(() => {
        if (isError) {
            console.error(error);

            message.error("Failed to load users");
        }
    }, [isError, error]);

    const filteredUsers = sortedUsers.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <Layout.Sider
            className=" min-h-[calc(100vh-125px)]! rounded bg-white!  shadow-sm border border-gray-200 "
            width={"256px"}
        >
            <div className="px-6 py-5 border-b border-gray-300">
                <div className="text-base font-semibold capitalize">
                    {`Welcome, ${userName || "User"}`}
                </div>
            </div>

            <div className="p-4 space-y-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search user..."
                    className="w-full border rounded px-3 py-2 border-gray-200"
                />

                
                
            </div>
            <div className="overflow-y-auto">
                {filteredUsers.map((user) => {
                    const status = userStatuses[user.id] || "offline";

                    return (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full px-6 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50
                                
                                ${selectedUser?.id === user.id
                                    ? "bg-slate-100"
                                    : ""
                                }`}
                        >
                            <div className="relative h-12 w-12 rounded-full bg-black text-white flex items-center justify-center capitalize font-semibold">
                                {user.name?.[0]}

                                <span
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full
                                        
                                        ${status === "online"
                                            ? "bg-green-500"
                                            : status === "away"
                                                ? "bg-yellow-400"
                                                : "bg-red-500"
                                        }`}
                                />
                            </div>

                            <div>
                                <div className="font-medium capitalize">{user.name}</div>

                                <div className="text-sm text-gray-500">({user.role})</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </Layout.Sider>
    );
}
