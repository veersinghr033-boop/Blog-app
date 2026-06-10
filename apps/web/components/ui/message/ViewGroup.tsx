import { Modal, Button, Popconfirm, message, Checkbox } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import { DeleteOutlined } from "@ant-design/icons";
import { useState } from "react"
interface User {
    id: string;
    userName: string;
}

interface Participant {
    _id: string;
    userName: string;
    role?: string;
}

interface GroupData {
    _id: String;
    name: string;
    admin: string;
    chatId: {
        participants: Participant[];
    };
}

function ViewGroup({
    open,
    onClose,
    Groups,
    SelectedUser
}: {
    open: boolean;
    onClose: () => void;
    Groups: String;
    SelectedUser: any;
}) {
    const userId = useAppSelector((state) => state.auth.user?.id);
    const queryClient = useQueryClient();

    const { data: group } = useQuery<GroupData>({
        enabled: !!Groups,
        queryKey: ["group", Groups],
        queryFn: async () => {
            const response = await api.get(`/groups/${Groups}`);
            return response.data;
        },
    });

    const deleteMemberMutation = useMutation({
        mutationFn: async ({ UserId, Groups }: any) => {
            return api.delete(`/groups/${UserId}`, {
                data: { Groups },
            });
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["group", Groups],
            });

            message.success("Member removed");
        },

        onError: () => {
            message.error("Failed to remove member");
        },
    });
    const deleteGroupMutation = useMutation({
        mutationFn: async (GroupId: String) => {
            return api.delete(`/groups/group/${GroupId}`);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["group", Groups],
            });
            onClose()
            SelectedUser(null)
            message.success("Group delete");
        },

        onError: () => {
            message.error("Failed to remove member");
        },
    });
    const handleDelete = (UserId: string) => {
        deleteMemberMutation.mutate({
            UserId,
            Groups,
        });
    };
    const handleGroupDelete = (GroupId: String) => {
        console.log("GroupId", GroupId)
        deleteGroupMutation.mutate(GroupId)

    };


    return (
        <Modal
            title="View Group"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <div className="p-2 border-b border-gray-200 mt-1 flex justify-between items-center">
                <h2 className="text-base font-semibold capitalize">
                    {group?.name}
                </h2>
                {group?.admin === userId && (
                    <Popconfirm
                        title="Delete the Group"
                        onConfirm={() =>
                            handleGroupDelete(Groups)
                        }
                    >
                        <Button
                            danger
                            type="text"
                            icon={
                                <DeleteOutlined />
                            }
                        />
                    </Popconfirm>
                )}
                {group?.admin !== userId && (
                    <Popconfirm
                        title="Delete the Group"
                        onConfirm={() => {
                            handleDelete(userId)
                            onClose()
                            SelectedUser(null)
                        }}
                    >
                        <Button
                            danger
                            type="text"

                        >exit</Button>
                    </Popconfirm>
                )}


            </div>

            <h2 className="text-xl font-semibold mt-3 mb-2">
                Members
            </h2>

            {group?.chatId?.participants?.map((user) => {
                const isAdmin =
                    user._id.toString() ===
                    group.admin.toString();

                return (
                    <div
                        key={user._id}
                        className="p-2 border border-gray-200 rounded bg-slate-100 mt-1 flex justify-between items-center"
                    >
                        <div className="font-semibold capitalize">
                            {user.userName}
                        </div>

                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <span className="bg-blue-200 px-2 rounded">
                                    admin
                                </span>
                            )}

                            {!isAdmin &&
                                group.admin === userId && (
                                    <Popconfirm
                                        title="Remove member?"
                                        onConfirm={() =>
                                            handleDelete(
                                                user._id
                                            )
                                        }
                                    >
                                        <Button
                                            danger
                                            type="text"
                                            icon={
                                                <DeleteOutlined />
                                            }
                                        />
                                    </Popconfirm>
                                )}
                        </div>
                    </div>
                );
            })}


        </Modal>
    );
}

export default ViewGroup;