"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAppSelector } from "@/lib/store/hooks";
import AddGroup from "./addGroup";
import Image from "next/image";
import { getSocket } from "@/utills/socket";


interface UserType {
  id: number;
  name: string;
  role: string;
}

export default function UserSidebar({
  selectedUser,
  setSelectedUser,
  statuses,
  mobile = false,
}: any) {
  const [search, setSearch] = useState("");
  const socketRef = useRef<any>(null);
  const [sortedUsers, setSortedUsers] = useState<UserType[]>([]);
  const [openAddGroup, setOpenAddGroup] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const userName = useAppSelector((state) => state.auth.user?.userName);

  useEffect(() => {
    setHydrated(true);
  }, []);
  const userId = useAppSelector((state) => state.auth.user?._id);


  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      console.log("Connected:", socket.id);
      socket.emit("userOnline", userId);
    };

    const handleSortedUsers = (users: any) => {
      setSortedUsers(users);
    };

    const handleDisconnect = (reason: string) => {
      console.log("DISCONNECTED", reason);
    };

    const handleError = (err: any) => {
      console.log("CONNECT ERROR", err);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    socket.on("sortedUsers", handleSortedUsers);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("sortedUsers", handleSortedUsers);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
    };
  }, [userId]);
  const filteredUsers = sortedUsers
    .filter((user) => user.name.toLowerCase().includes(search.toLowerCase()))
    .map((user) => ({
      ...user,
    }));

  return (
    <div
      style={{ width: mobile ? "100%" : 250 }}
      className={`flex h-full min-h-0 flex-col bg-white shadow-sm border border-gray-200 border-r-0 ${mobile ? "rounded-none" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-300 px-4 py-3">
        <div className="overflow-x-auto text-base font-semibold capitalize w-1/2">
          {hydrated ? `Welcome to, ${userName || "User"}` : "Welcome to, User"}
        </div>

        <button className="bg-black text-white px-2.5 py-1 rounded" onClick={() => setOpenAddGroup(true)}>Add Group</button>
      </div>

      <div className="p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full rounded border border-gray-200 px-3 py-2"
        />
      </div>

      <div className="z-1 flex-1 h-[82%] overflow-y-auto">
        {filteredUsers.map((item: any) => {
          const isGroup = item.type === "group";
          const chatKey = item.id || item._id;
          const status = !isGroup ? statuses[item.id] || "offline" : null;
          const isSelected = selectedUser?.id == item.id || selectedUser?.id === item._id;

          return (
            <button
              key={chatKey}
              onClick={() => setSelectedUser(item)}
              className={`w-full px-4 py-4 flex items-center gap-3 border-y border-gray-200 hover:bg-slate-50 ${isSelected ? "bg-slate-100" : ""}`}
            >
              <div className="relative">
                <div className="relative h-12 w-12 rounded-full bg-black text-white flex items-center justify-center capitalize font-semibold overflow-hidden">
                  {item.img ? (
                  //   <
                  //     src = {item.img}
                  // alt={item.name}
                  // className="h-full w-full object-cover"
                  //   />
                  <Image
                    src={item.img} 
                    alt={item.name}

                    fill
                    className="object-cover"
                  />
                  ) : (
                  item.name?.charAt(0)
                  )}
                </div>
                {item.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{item.unreadCount > 99 ? '99+' : item.unreadCount}</span>
                )}

                {!isGroup && (
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${status === "online" ? "bg-green-500" : status === "away" ? "bg-yellow-400" : "bg-red-500"}`}
                  />
                )}
              </div>

              <div className="text-left">
                <div className="font-medium capitalize">{item.name}</div>

                <div className="text-sm text-gray-500">{isGroup ? `Group` : "User"}</div>
              </div>
            </button>
          );
        })}
      </div>

      <AddGroup open={openAddGroup} onClose={() => setOpenAddGroup(false)} />
    </div>
  );
}
