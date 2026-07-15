"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { toast } from "sonner";
import  Upload from "antd/es/upload";
import type  UploadFile  from "antd/es/upload/interface";
import Image from "next/image";
import { Plus as PlusOutlined } from "lucide-react";

interface User {
    id: string;
    name: string;
}

function AddGroup({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [groupImage, setGroupImage] = useState<File | null>(null);
    const [preview, setPreview] = useState("");

    const queryClient = useQueryClient();

    const {
        data: users = [],
        isError,
        error,
    } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await api.get("/users/all-data");

            const usersData = response.data?.users ?? [];

            return usersData.map((user: any) => ({
                id: user._id,
                name: user.userName,
            }));
        },
    });

    useEffect(() => {
        if (isError) {
            console.error(error);
            toast.error("Failed to fetch users");
        }
    }, [isError, error]);

    const createGroupMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();

            formData.append("groupName", groupName);

            selectedMembers.forEach((member) => {
                formData.append("members", member);
            });

            if (groupImage) {
                formData.append("groupImage", groupImage);
            }

            const res = await api.post(
                "/groups/create",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return res.data;
        },

        onSuccess: () => {
            setGroupName("");
            setSelectedMembers([]);
            setGroupImage(null);
            setPreview("");

            queryClient.invalidateQueries({
                queryKey: ["groups"],
            });

            toast.success("Group created successfully");
            onClose();
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to create group"
            );
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!groupName.trim()) {
            toast.warning("Group name cannot be empty");
            return;
        }

        if (selectedMembers.length === 0) {
            toast.warning("Please select at least one member");
            return;
        }

        createGroupMutation.mutate();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-40 flex">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div className="relative m-auto w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-semibold">
                        Create New Group
                    </h3>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex gap-4 items-center">
                        <Upload
                            listType="picture-circle"
                            maxCount={1}
                            showUploadList={false}
                            beforeUpload={(file) => {
                                setGroupImage(file);
                                setPreview(URL.createObjectURL(file));
                                return false;
                            }}
                            style={{ width: 80, height: 80 }}
                        >
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt="group"
                                    width={100}
                                    height={100}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 5 }}>
                                        Upload
                                    </div>
                                </div>
                            )}
                        </Upload>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Group Name
                            </label>

                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) =>
                                    setGroupName(e.target.value)
                                }
                                placeholder="Enter group name"
                                className="w-full border rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>


                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Members
                        </label>

                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center"
                                >
                                    <input
                                        type="checkbox"
                                        id={user.id}
                                        checked={selectedMembers.includes(
                                            user.id
                                        )}
                                        onChange={(e) =>
                                            setSelectedMembers((prev) =>
                                                e.target.checked
                                                    ? [...prev, user.id]
                                                    : prev.filter(
                                                        (id) =>
                                                            id !==
                                                            user.id
                                                    )
                                            )
                                        }
                                    />

                                    <label
                                        htmlFor={user.id}
                                        className="ml-2 text-sm"
                                    >
                                        {user.name}
                                    </label>
                                </div>
                            ))}

                            {users.length === 0 && (
                                <div className="text-center text-gray-500">
                                    No users available
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={createGroupMutation.isPending}
                        className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                    >
                        {createGroupMutation.isPending
                            ? "Creating..."
                            : "Create Group"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddGroup;