"use client"
import { Layout, Table, Input, Button } from "antd"
import { adminUsers } from "@/lib/mock-data"

const { Search } = Input

function Users() {
    return (
        <Layout >
            <header className="flex flex-col  gap-4 border-b border-gray-200 px-6 py-4">
                <div >
                    <h2 className="text-2xl">Users Management</h2>
                    <p className="text-gray-500">Manage platform users and permissions</p>
                </div>
                <div className="w-full max-w-md">
                    <Search placeholder="Search users..." />
                </div>

            </header>
            <Table
                className="p-6"
                columns={[
                    { title: "Name", dataIndex: "name", key: "name" },
                    { title: "Email", dataIndex: "email", key: "email" },
                    { title: "Role", dataIndex: "role", key: "role" },
                    { title: "Status", dataIndex: "status", key: "status" },
                    { title: "joinedAt", dataIndex: "joined", key: "joined" },
                    {
                        title: "Actions", key: "actions", render: () => <div className="flex gap-2">
                            <Button type="primary" size="small">Edit</Button>
                            <Button danger size="small">Delete</Button>
                        </div>
                    },
                ]}
                dataSource={adminUsers}

            />

        </Layout>
    )
}

export default Users
