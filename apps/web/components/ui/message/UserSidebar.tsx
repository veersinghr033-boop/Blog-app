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
  // console.log(sortedUsers)

  return (
    <Layout.Sider
      width={250}
      className="h-[calc(100vh-113px)]!  overflow-auto bg-white! shadow-sm border border-gray-200 border-r-0"
    >
      <div className="px-4 flex  gap-2 justify-between items-center py-2 border-b border-gray-300">
        <div className="text-base font-semibold capitalize overflow-x-auto">
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

      <div className="p-4 ">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full border rounded px-3 py-2 border-gray-200"
        />
      </div>

      <div className="overflow-y-auto h-[calc(100vh-260px)] overflow-auto z-1" >
        {filteredUsers.map((item: any) => {
          const isGroup = item.type === "group";
          const chatKey = item.id || item._id;
          const status = !isGroup ? statuses[item.id] || "offline" : null;
          const isSelected = selectedUser?.id === item.id || selectedUser?._id === item._id;

          return (
            <button
              key={chatKey}
              onClick={() => setSelectedUser(item)}
              className={`w-full px-6 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50
                ${isSelected ? "bg-slate-100" : ""}`}
            >
              <Badge count={item.unreadCount} overflowCount={99}>
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
