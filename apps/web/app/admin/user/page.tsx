"use client"

import { Layout, Table, Input, Button, message } from "antd"
import { useQuery } from "@tanstack/react-query"
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
                status: "Active",
                joined: new Date(user.createdAt).toLocaleDateString(),
            }))
        },
    })

    // Show error message only once
    useEffect(() => {
        if (isError) {
            console.error("Error fetching users:", error)
            message.error("Failed to fetch users")
        }
    }, [isError, error])

    // Filter users
    const filteredUsers = useMemo(() => {
        return users.filter((user) =>
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [users, searchText])

    const handleDelete = (id: string) => {
        console.log("Delete user:", id)
    }

    const handleEdit = (id: string) => {
        console.log("Edit user:", id)
    }

    return (
        <Layout className="min-h-screen bg-white">
            <header className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Users Management
                    </h2>

                    <p className="text-gray-500">
                        Manage platform users and permissions
                    </p>
                </div>

                <div className="w-full max-w-md">
                    <Search
                        placeholder="Search users..."
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </header>

            <Table
                className="p-6"
                loading={isLoading}
                dataSource={filteredUsers}
                rowKey="key"
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
                        title: "Status",
                        dataIndex: "status",
                        key: "status",
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
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => handleEdit(record.key)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    danger
                                    size="small"
                                    onClick={() => handleDelete(record.key)}
                                >
                                    Delete
                                </Button>
                            </div>
                        ),
                    },
                ]}
            />
        </Layout>
    )
}

export default Users