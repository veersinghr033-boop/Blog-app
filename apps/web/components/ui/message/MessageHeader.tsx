"use client";

import { Users } from "lucide-react";
import ViewGroup from "./ViewGroup";
import { useState } from "react";
import Image from "next/image";
interface MessageHeaderProps {
  selectedUser: any;
  userStatuses: Record<string, string>;
  setSelectedUser: any;
  mobile?: boolean;
  onOpenSidebar?: () => void;
}

export default function MessageHeader({
  selectedUser,
  userStatuses,
  setSelectedUser,
  mobile = false,
  onOpenSidebar,
}: MessageHeaderProps) {
  const [open, setOpen] = useState(false);
  const [selectGroup, setSelectGroup] = useState<String>("");
  const handleView = () => {
    if (selectedUser?.type === "group") {
      setOpen(true);
      setSelectGroup(selectedUser.id);
    } else {
      setOpen(false);
    }
  };
  return (
    <>
      <header className="flex items-center gap-2 border-b border-gray-300 bg-white px-3 py-4 sm:px-6">
        {mobile && onOpenSidebar ? (
          <button className="shrink-0 md:hidden p-2" onClick={onOpenSidebar} aria-label="Open menu">☰</button>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 cursor-pointer" onClick={handleView}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white font-semibold uppercase relative">
            {selectedUser?.img ? (
              <Image
                src={selectedUser.img}
                alt={selectedUser.name}

                fill
                className="object-cover rounded-full"
              />
            ) : (
              selectedUser?.name?.charAt(0)
            ) ? (
              selectedUser?.name?.charAt(0)
            ) : (
              "U"
            )}



            {selectedUser?.type !== "group" && (
              <span
                className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${userStatuses[selectedUser?.id || ""] === "online"
                  ? "bg-green-500"
                  : userStatuses[selectedUser?.id || ""] === "away"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                  }`}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="truncate text-base font-semibold capitalize">
              {selectedUser?.name || "Open a chat"}
            </div>

            <div className="truncate text-xs text-gray-500">
              {selectedUser?.type === "group"
                ? "Group Chat"
                : userStatuses[selectedUser?.id || ""] || "offline"}
            </div>
          </div>
        </div>
      </header>
      <ViewGroup
        open={open}
        onClose={() => setOpen(false)}
        Groups={selectGroup}
        SelectedUser={setSelectedUser}
      />
    </>
  );
}
