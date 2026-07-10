"use client";

import { Table, Button, message, Popconfirm } from "antd";
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import api from "@/utills/axios";
import { useMemo, useState } from "react";

interface UserType {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  createdAt: Date;
}

function Users() {
  const [searchText, setSearchText] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["users"],
      queryFn: async ({ pageParam = null }) => {
        const res = await api.get("/users", {
          params: {
            before: pageParam,
          },
        });

        return res.data;
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
    });

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) ?? [];
  }, [data]);
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = user.userName?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";

      return (
        name.includes(searchText.toLowerCase()) ||
        email.includes(searchText.toLowerCase())
      );
    });
  }, [users, searchText]);
  const joinAt = (user: UserType) => {
    const date = new Date(user.createdAt);
    return date.toLocaleDateString();
  };
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
    },

    onSuccess: () => {
      message.success("User deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      message.error("Failed to delete user");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen ">
      <header className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-2xl font-semibold">Users Management</h2>

          <p className="text-gray-500">Manage platform users and permissions</p>
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
        rowKey="_id"
        scroll={{ x: 800 }}
        pagination={{
          pageSize: 5,
          onChange: (page) => {
            const totalLoadedPages = data?.pages.length ?? 0;

            if (page > totalLoadedPages && hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          },
        }}
        columns={[
          {
            title: "Name",
            dataIndex: "userName",
            key: "userName",
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
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value: Date) => joinAt({ createdAt: value } as UserType),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: UserType) => (
              <div className="flex gap-2">
                <Popconfirm
                  title="Are you sure you want to delete this user?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <button className="bg-red-500 text-white px-3 py-1 rounded">
                    Delete
                  </button>
                </Popconfirm>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default Users;
