"use client";

import { TeamOutlined } from "@ant-design/icons";
import ViewGroup from "./ViewGroup";
import { useState } from "react";
interface MessageHeaderProps {
  selectedUser: any;
  userStatuses: Record<string, string>;
  setSelectedUser: any;
}

export default function MessageHeader({
  selectedUser,
  userStatuses,
  setSelectedUser,
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
      <header className="flex items-center border-b border-gray-300 bg-white px-6 py-3">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={handleView}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white font-semibold uppercase relative">
            {selectedUser?.type === "group" ? (
              <TeamOutlined />
            ) : (
              selectedUser?.name?.[0] || "U"
            )}

            {selectedUser?.type !== "group" && (
              <span
                className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${
                  userStatuses[selectedUser?.id || ""] === "online"
                    ? "bg-green-500"
                    : userStatuses[selectedUser?.id || ""] === "away"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                }`}
              />
            )}
          </div>

          <div>
            <div className="text-base font-semibold capitalize">
              {selectedUser?.name || "Open a chat"}
            </div>

            <div className="text-xs text-gray-500">
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
