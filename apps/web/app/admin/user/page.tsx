"use client"

import { Table, Input, Button, message, Popconfirm } from "antd"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/utills/axios"
import { useMemo, useState, useEffect } from "react"

const { Search } = Input
interface UserType {
    key: string
    name: string
    email: string
    role: string
    status: string
    joined: string
}

function Users() {
    const [searchText, setSearchText] = useState("")
    const queryClient = useQueryClient();

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
                email: user.email,
                role: user.role,
                joined: new Date(user.createdAt).toLocaleDateString(),
            }))
        },
    })

    useEffect(() => {
        if (isError) {
            console.error("Error fetching users:", error)
            message.error("Failed to fetch users")
        }
    }, [isError, error])

    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [users, searchText])

    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/users/${userId}`)
        },

        onSuccess: () => {
            message.success("User deleted successfully")
            queryClient.invalidateQueries({
                queryKey: ["users"],
            })
        },
        onError: (error) => {
            console.error("Error deleting user:", error)
            message.error("Failed to delete user")
        },
    })

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id)
    }

    return (
        <div className="min-h-screen ">
            <header className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Users Management
                    </h2>

                    <p className="text-gray-500">
                        Manage platform users and permissions
                    </p>
                </div>

                <input
                    className="w-full sm:flex-1 p-2 bg-white mt-2 rounded-lg "

                    placeholder="Search users..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </header>

            <Table
                className="p-6"
                loading={isLoading}
                dataSource={filteredUsers}
                rowKey="key"
                scroll={{ x: 800 }}
                pagination={{ pageSize: 5 }}
                columns={[
                    {
                        title: "Name",
                        dataIndex: "name",
                        key: "name",
                    },
                    {
                        title: "Email",
                        dataIndex: "email",
                        key: "email",
                    },
                    {
                        title: "Role",
                        dataIndex: "role",
                        key: "role",
                    },

                    {
                        title: "Joined At",
                        dataIndex: "joined",
                        key: "joined",
                    },
                    {
                        title: "Actions",
                        key: "actions",
                        render: (_: any, record: UserType) => (
                            <div className="flex gap-2">


                                <Popconfirm
                                    title="Are you sure you want to delete this user?"
                                    onConfirm={() => handleDelete(record.key)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button type="primary" danger size="small">
                                        Delete
                                    </Button>
                                </Popconfirm>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    )
}

export default Users