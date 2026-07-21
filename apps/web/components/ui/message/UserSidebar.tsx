"use client";

import { useEffect, useState, useRef } from "react";
import { Virtuoso } from "react-virtuoso"; 
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
  const [loadingMore, setLoadingMore] = useState(false);
    const [openAddGroup, setOpenAddGroup] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] =
    useState(true);

  const [sortedUsers, setSortedUsers] =
    useState<any[]>([]);
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
      socket.emit(
        "userOnline",
        userId
      );

      socket.emit("getUsers", {
        userId,
        page: 1,
        limit: 10,
      });
    };

    const handleSortedUsers = (data: any) => {
      setLoadingMore(false);
      setHasMore(data.hasMore);

      if (data.page === 1) {
        setSortedUsers(data.users);
      } else {
        setSortedUsers((prev) => [...prev, ...data.users]);
      }
    };

    const handleDisconnect = (reason: string) => {
      // console.log("DISCONNECTED",// reason);
    };

    const handleError = (err: any) => {
      console.error("CONNECT ERROR", err);
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
      className={`flex h-full min-h-0 flex-col bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 border-r-0 ${mobile ? "rounded-none" : ""
        }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-300 dark:border-zinc-800 px-4 py-3">
        <div className="overflow-x-auto text-base font-semibold capitalize w-1/2 text-black dark:text-white">
          {hydrated
            ? `Welcome to, ${userName || "User"}`
            : "Welcome to, User"}
        </div>

        <button
          className="bg-black dark:bg-white text-white dark:text-black px-2.5 py-1 rounded hover:bg-gray-800 dark:hover:bg-gray-200"
          onClick={() => setOpenAddGroup(true)}
        >
          Add Group
        </button>
      </div>

      <div className="p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white px-3 py-2"
        />
      </div>

      <div className="flex-1 h-[82%]">
        <Virtuoso
          style={{ height: "100%" }}
          data={filteredUsers}
          endReached={() => {
            if (!hasMore || loadingMore) return;

            setLoadingMore(true);

            socketRef.current?.emit("getUsers", {
              userId,
              page: page + 1,
              limit: 10,
            });
          }}
          itemContent={(index, item: any) => {
            const isGroup = item.type === "group";
            const chatKey = item.id || item._id;
            const status = !isGroup
              ? statuses[item.id] || "offline"
              : null;

            const isSelected =
              selectedUser?.id == item.id ||
              selectedUser?.id === item._id;

            return (
              <button
                key={chatKey}
                onClick={() => setSelectedUser(item)}
                className={`w-full px-4 py-4 flex items-center gap-3 border-y border-gray-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 ${isSelected
                    ? "bg-slate-100 dark:bg-zinc-800"
                    : ""
                  }`}
              >
                <div className="relative">
                  <div className="relative h-12 w-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center capitalize font-semibold overflow-hidden">
                    {item.img ? (
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="rounded-full object-cover"
                      />
                    ) : (
                      item.name?.charAt(0)
                    )}
                  </div>

                  {item.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {item.unreadCount > 99
                        ? "99+"
                        : item.unreadCount}
                    </span>
                  )}

                  {!isGroup && (
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${status === "online"
                          ? "bg-green-500"
                          : status === "away"
                            ? "bg-yellow-400"
                            : "bg-red-500"
                        }`}
                    />
                  )}
                </div>

                <div className="text-left">
                  <div className="font-medium capitalize text-black dark:text-white">
                    {item.name}
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isGroup ? "Group" : "User"}
                  </div>
                </div>
              </button>
            );
          }}
        />
      </div>

      <AddGroup
        open={openAddGroup}
        onClose={() => setOpenAddGroup(false)}
      />
    </div>
  );
}
