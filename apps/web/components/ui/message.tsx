"use client"

import { Layout } from "antd"
import { useState } from "react"
import MessageChat from "./messageChat"
import { useQuery } from "@tanstack/react-query"
import api from "@/utills/axios"
import { message } from "antd"
import { useEffect } from "react"
import { useAppSelector } from "@/lib/store/hooks"

interface UserType {
    key: string
    name: string
    email: string
    role: string
    status: string
    joined: string
}
function Message() {
    const [search, setSearch] = useState("")
    const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

    const { Sider, Content } = Layout

    const userId = useAppSelector((state) => state.auth.user?.userName)

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
                key: user._id,
                name: user.userName,
                // email: user.email,
                role: user.role,
                // joined: new Date(user.createdAt).toLocaleDateString(),
            }))
        },
    })

    useEffect(() => {
        if (isError) {
            console.error("Error fetching users:", error)
            message.error("Failed to fetch users")
        }
    }, [isError, error])

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelectUser = (user: UserType) => {
        setSelectedUser(user);
    };
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
                        const status = userStatuses[user.key] || "offline";

                        return (
                            <button
                                key={user.key}
                                onClick={() => handleSelectUser(user)}
                                className={`w-full text-left px-6 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50 ${selectedUser?.key === user.key ? "bg-slate-100" : "bg-white"
                                    }`}
                            >
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-black text-white font-semibold uppercase">
                                    {user.name?.[0] || "U"}

                                    {/* <span
                                        className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${status === "online"
                                            ? "bg-green-500"
                                            : status === "away"
                                                ? "bg-yellow-400"
                                                : "bg-red-400"
                                            }`}
                                    /> */}
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
