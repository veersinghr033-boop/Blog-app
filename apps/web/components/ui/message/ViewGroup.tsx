import { Modal, Button, Popconfirm, message, Checkbox, Form } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import AddMember from "./AddMember";
import useUserStatus from "./useUserStatus";

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
    SelectedUser,
}: {
    open: boolean;
    onClose: () => void;
    Groups: String;
    SelectedUser: any;
}) {
    const userId = useAppSelector((state) => state.auth.user?.id);
    const queryClient = useQueryClient();
    const [openAddMember, setOpenMember] = useState(false);
    const { statuses: userStatuses } = useUserStatus(userId);

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
            onClose();
            SelectedUser(null);
            message.success("Group delete");
        },

        onError: () => {
            message.error("Failed to remove member");
        },
    });
    const changeAdminMutation = useMutation({
        mutationFn: async (newAdminId: string) => {
            return api.put(`/groups/admin/${Groups}`, {
                adminId: newAdminId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["group", Groups],
            });

            message.success("Admin changed successfully");
        },

        onError: () => {
            message.error("Failed to change admin");
        },
    });
    const handleDelete = (UserId: string) => {
        if (group?.admin === UserId) {
            message.warning(
                "Admin cannot be removed. Please assign admin role to another member before removing.",
            );
            return;
        }
        deleteMemberMutation.mutate({
            UserId,
            Groups,
        });
    };
    const handleGroupDelete = (GroupId: String) => {
        console.log("GroupId", GroupId);
        deleteGroupMutation.mutate(GroupId);
    };
    const handleChangeAdmin = (newAdminId: string) => {
        changeAdminMutation.mutate(newAdminId);
    };

    return (
        <Modal title="View Group" open={open} onCancel={onClose} footer={null}>
            <div className="p-2 border-b border-gray-200 mt-1 flex justify-between items-center">
                <h2 className="text-base font-semibold capitalize">{group?.name}</h2>
                {group?.admin === userId && (
                    <Popconfirm
                        title="Delete the Group"
                        onConfirm={() => handleGroupDelete(Groups)}
                    >
                        <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>
                )}
            </div>

            <h2 className="text-xl font-semibold mt-3 mb-2">Members</h2>

            {group?.chatId?.participants?.map((user) => {
                const isAdmin = user._id.toString() === group.admin.toString();
                const status = userStatuses[user._id] || "offline";

                return (
                    <div
                        key={user._id}
                        className="p-2 border border-gray-200 rounded bg-slate-100 mt-1 flex justify-between items-center"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative h-10 w-10 rounded-full bg-black text-white flex items-center justify-center capitalize font-semibold">
                                {user.userName?.[0]}

                                <span
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full
                      ${status === "online"
                                            ? "bg-green-500"
                                            : status === "away"
                                                ? "bg-yellow-400"
                                                : "bg-red-500"
                                        }`}
                                />
                            </div>
                            <div className="font-semibold capitalize">{user._id === userId ? "You" : user.userName}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <span className="bg-blue-200 px-2 rounded">admin</span>
                            )}

                            {!isAdmin && group.admin === userId && (
                                <>
                                    <Popconfirm
                                        title="Make this member the new admin?"
                                        onConfirm={() => handleChangeAdmin(user._id)}
                                    >
                                        <Button
                                            size="small"
                                            loading={changeAdminMutation.isPending}
                                            title="Make this member the new admin?"
                                            type="text"
                                            icon={<EditOutlined />}
                                        />
                                    </Popconfirm>
                                    <Popconfirm
                                        title="Remove member?"
                                        onConfirm={() => handleDelete(user._id)}
                                    >
                                        <Button danger type="text" icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
            <div className="mt-3 flex justify-between items-center">
                <Popconfirm
                    title="Delete the Group"
                    onConfirm={() => {
                        handleDelete(userId);
                        onClose();
                        SelectedUser(null);
                    }}
                >
                    <Button danger type="text" className="bg-red-200! text-red-500!">
                        exit
                    </Button>
                </Popconfirm>

                {group?.admin === userId && (   
                    <Button
                        type="primary"
                        className="bg-blue-200! text-blue-500!"
                        onClick={() => setOpenMember(!openAddMember ? true : false)}
                    >
                        Add Member
                    </Button>
                )}
            </div>
            {openAddMember && (
                <AddMember group={group} onClose={() => setOpenMember(false)} />
            )}
        </Modal>
    );
}

export default ViewGroup;