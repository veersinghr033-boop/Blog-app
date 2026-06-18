"use client";

import { Layout, Button, Badge } from "antd";
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

export default function UserSidebar({
  selectedUser,
  setSelectedUser,
  notifications,
  statuses,
  mobile = false,
}: any) {
  const [search, setSearch] = useState("");
  const socketRef = useRef<any>(null);
  const [sortedUsers, setSortedUsers] = useState<UserType[]>([]);
  const [openAddGroup, setOpenAddGroup] = useState(false);

  const userName = useAppSelector((state) => state.auth.user?.userName);

  const userId = useAppSelector((state) => state.auth.user?.id);


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
  // console.log(selectedUser)

  return (
    <Layout.Sider
      width={mobile ? "100%" : 250}
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-white! shadow-sm border border-gray-200 border-r-0 ${mobile ? "rounded-none" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-300 px-4 py-3">
        <div className="overflow-x-auto text-base font-semibold capitalize">
          Welcome to, {userName || "User"}
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
          className="w-full rounded border border-gray-200 px-3 py-2"
        />
      </div>

      <div className="z-1 flex-1 overflow-y-auto">
        {filteredUsers.map((item: any) => {
          console.log()
          const isGroup = item.type === "group";
          const chatKey = item.id || item._id;
          const status = !isGroup ? statuses[item.id] || "offline" : null;
          const isSelected = selectedUser?.id == item.id || selectedUser?.id === item._id;

          return (
            <button
              key={chatKey}
              onClick={() => setSelectedUser(item)}
              className={`w-full px-4 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50
                ${isSelected ? "bg-slate-100" : ""}`}
            >
              <Badge count={item.unreadCount} overflowCount={9}>
                <div className="relative h-12 w-12 rounded-full bg-black text-white flex items-center justify-center capitalize font-semibold">
                  {isGroup ? <TeamOutlined /> : item.name?.[0]}
                </div>
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
              </Badge>



              <div className="text-left">
                <div className="font-medium capitalize">{item.name}</div>

                <div className="text-sm text-gray-500">
                  {isGroup ? `Group` : "User"}
                </div>
              </div>
            </button>
          );
        })}
      </div >

      <AddGroup open={openAddGroup} onClose={() => setOpenAddGroup(false)} />
    </Layout.Sider >
  );
}
