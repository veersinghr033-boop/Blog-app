"use client";

import { Layout, Button } from "antd";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAppSelector } from "@/lib/store/hooks";
import useUserStatus from "./useUserStatus";
import AddGroup from "./addGroup";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { getSocket } from "@/utills/socket";


interface UserType {
  id: number;
  name: string;
  role: string;
}

export default function UserSidebar({ selectedUser, setSelectedUser }: any) {
  const [search, setSearch] = useState("");
  const socketRef = useRef<any>(null);
  const [sortedUsers, setSortedUsers] = useState<UserType[]>([]);
  const [openAddGroup, setOpenAddGroup] = useState(false);

  const userName = useAppSelector((state) => state.auth.user?.userName);

  const userId = useAppSelector((state) => state.auth.user?.id);

  const {
    statuses,
    notifications,
  } = useUserStatus(userId);
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
  }, [userId, openAddGroup]);

  const filteredUsers = sortedUsers
    .filter((user) => user.name.toLowerCase().includes(search.toLowerCase()))
    .map((user) => ({
      ...user,
      //   type: "user",
    }));

  // console.log(filteredUsers)

  return (
    <Layout.Sider
      width={250}
      className="min-h-[calc(100vh-125px)] bg-white! shadow-sm border border-gray-200 border-r-0"
    >
      <div className="px-4 flex gap-2 justify-between items-center py-4 border-b border-gray-300">
        <div className="text-base font-semibold capitalize truncate">
          Welcome, {userName || "User"}
        </div>

        <Button
          type="primary"
          className="bg-black!"
          onClick={() => setOpenAddGroup(true)}
        >
          Add Group
        </Button>
      </div>

      <div className="p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full border rounded px-3 py-2 border-gray-200"
        />
      </div>

      <div className="overflow-y-auto">
        {filteredUsers.map((item: any) => {
          const isGroup = item.type === "group";
          const status = !isGroup ? statuses[item.id] || "offline" : null;

          return (
            <button
              key={isGroup ? item._id : item.id}
              onClick={() => setSelectedUser(item)}
              className={`w-full px-6 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50
                ${selectedUser?.id === item.id ? "bg-slate-100" : ""}`}
            >
              <div className="relative h-12 w-12 rounded-full bg-black text-white flex items-center justify-center capitalize font-semibold">
                {isGroup ? <TeamOutlined /> : item.name?.[0]}
                {notifications[item.id] > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1">
                    {notifications[item.id]}
                  </span>
                )}
                {!isGroup && (
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full
                      ${status === "online"
                        ? "bg-green-500"
                        : status === "away"
                          ? "bg-yellow-400"
                          : "bg-red-500"
                      }`}
                  />
                )}
              </div>

              <div className="text-left">
                <div className="font-medium capitalize">{item.name}</div>

                <div className="text-sm text-gray-500">
                  {isGroup ? `Group` : `(${item.role})`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <AddGroup open={openAddGroup} onClose={() => setOpenAddGroup(false)} />
    </Layout.Sider>
  );
}
