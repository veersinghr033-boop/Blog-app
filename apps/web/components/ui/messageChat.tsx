"use client"

import { Layout } from "antd"

interface UserType {
    key: string
    name: string
    role: string
}

interface MessageChatProps {
    selectedUser: UserType | null
}


function MessageChat({ selectedUser }: MessageChatProps) {
    return (
        <Layout className=" p-4 md:p-0">
            <div className=" h-[calc(100vh-115px)] rounded bg-white shadow-sm border border-gray-200">
                <header className="flex items-center border-b border-gray-300 bg-white px-6 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white font-semibold uppercase relative">
                            {selectedUser?.name?.[0] || "U"}
                            {/* <span
                                className={`w-3 h-3 rounded-full absolute bottom-0 right-0 ${userStatuses[selectedUser?._id] === "online"
                                        ? "bg-green-500"
                                        : userStatuses[selectedUser?._id] === "away"
                                            ? "bg-yellow-400"
                                            : "bg-red-400"
                                    }`}
                            ></span> */}
                        </div>
                        <div className="text-base font-semibold capitalize">
                            {selectedUser ? selectedUser.name : "Open a chat"}
                        </div>
                    </div>
                </header>
                {selectedUser ? (
                    <>
                        <div className="h-[calc(100%-140px)] p-6 overflow-y-auto">
                            <div className="text-center text-gray-400">
                                No messages yet
                            </div>
                        </div>

                        <div className="border-t border-gray-200 p-4 flex gap-3">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none"
                            />

                            <button className="bg-black text-white px-5 py-2 rounded-lg">
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center text-gray-500">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default MessageChat