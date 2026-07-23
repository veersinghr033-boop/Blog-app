import { toast } from "sonner";
import Popconfirm from "antd/es/popconfirm";
import Modal from "antd/es/modal";
import Button from "antd/es/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import AddMember from "./AddMember";
import useUserStatus from "./useUserStatus";
import { Ellipsis, Trash2, LogOut, User } from "lucide-react";
import ImageUpload from "../ImageUpload";
interface Participant {
    _id: string;
    userName: string;
    role?: string;
    profileImage?: string;
}

interface GroupData {
    _id: String;
    name: string;
    admin: string | string[];
    groupImage: string;
    chatId: {
        participants: Participant[];
    };

}

const ViewGroup = memo(({
    open,
    onClose,
    Groups,
    SelectedUser,
}: {
    open: boolean;
    onClose: () => void;
    Groups: String;
    SelectedUser: any;
}) => {
    const userId = useAppSelector((state) => state.auth.user?._id);
    const queryClient = useQueryClient();
    const [openAddMember, setOpenMember] = useState(false);
    const { statuses: userStatuses } = useUserStatus(userId);
    const [groupName, setGroupName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupFile, setGroupFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [removeProfileImage, setRemoveProfileImage] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: group } = useQuery<GroupData>({
        enabled: !!Groups,
        queryKey: ["group", Groups],
        queryFn: async () => {
            const response = await api.get(`/groups/${Groups}`);
            return response.data;
        },
    });

    const adminIds = useMemo(() => {
        if (!group?.admin) return [];
        return Array.isArray(group.admin)
            ? group.admin.map((id) => id?.toString())
            : [group.admin.toString()];
    }, [group?.admin]);
    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setGroupFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setRemoveProfileImage(false);

        setIsModalOpen(false);

    };
    const handleRemoveProfileImage = () => {
        setGroupFile(null);
        setAvatarPreview("");
        setRemoveProfileImage(true);

        // Close the modal only
        setIsModalOpen(false);
    };
    const isCurrentUserAdmin = useMemo(() => adminIds.includes(userId?.toString() || ""), [adminIds, userId]);

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
            onClose();
            SelectedUser(null);
            toast.success("Member removed");
        },

        onError: () => {
            toast.error("Failed to remove member");
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
            toast.success("Group delete");
        },

        onError: () => {
            toast.error("Failed to remove member");
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

            toast.success("Admin changed successfully");
        },

        onError: () => {
            toast.error("Failed to change admin");
        },
    });

    const removeAdminMutation = useMutation({
        mutationFn: async (adminId: string) => {
            return api.put(`/groups/remove-admin/${Groups}`, {
                adminId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["group", Groups],
            });
            toast.success("Admin role removed");
        },
        onError: () => {
            toast.error("Failed to remove admin role");
        },
    });

    const isUserAdmin = useCallback((userIdToCheck: string) => {
        return adminIds.includes(userIdToCheck?.toString() || "");
    }, [adminIds]);


    const handleDelete = useCallback((memberId: string) => {
        const isLeavingUserAdmin = isUserAdmin(memberId);

        if (
            memberId === userId &&
            isLeavingUserAdmin &&
            adminIds.length === 1
        ) {
            toast.warning(
                "You are the only admin. Assign another admin before leaving the group."
            );
            return;
        }

        if (
            memberId !== userId &&
            isLeavingUserAdmin
        ) {
            toast.warning(
                "Admin cannot be removed. Please change their role first."
            );
            return;
        }

        deleteMemberMutation.mutate({
            UserId: memberId,
            Groups,
        });
    }, [isUserAdmin, adminIds.length, userId, deleteMemberMutation, Groups]);

    const handleGroupDelete = useCallback((GroupId: String) => {
        deleteGroupMutation.mutate(GroupId);
    }, [deleteGroupMutation]);

    const handleChangeAdmin = useCallback((newAdminId: string) => {
        changeAdminMutation.mutate(newAdminId);
    }, [changeAdminMutation]);

    const handleRemoveAdmin = useCallback((adminId: string) => {
        if (adminIds.length === 1) {
            toast.warning(
                "The last admin cannot be removed."
            );
            return;
        }

        removeAdminMutation.mutate(adminId);
    }, [adminIds.length, removeAdminMutation]);

    const updateGroupMutation = useMutation({
        mutationFn: async ({
            file,
            name,
            removeImage,
        }: {
            file?: File;
            name?: string;
            removeImage?: boolean;
        }) => {
            const formData = new FormData();

            if (file) {
                formData.append("groupImage", file);
            }

            if (name) {
                formData.append("name", name);
            }

            if (removeImage) {
                formData.append("removeImage", "true");
            }

            return api.put(`/groups/${Groups}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onMutate: () => {
            updateGroupMutation.isPending = true;
            toast.loading("Updating group image...");

            return () => {
                updateGroupMutation.isPending = false;
            };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["group", Groups],
            });

            toast.dismiss();
            toast.success("Group updated");

            setAvatarPreview("");
            setRemoveProfileImage(false);

            setIsEditing(false);
            setIsModalOpen(false);
        }
    });
    useEffect(() => {
        if (group?.name) {
            setGroupName(group.name);
        }
    }, [group]);
    return (
        <>
            <Modal
                title="View Group"
                open={open}
                onCancel={onClose}
                footer={null}
            >

                <div
                    className="cursor-pointer"
                    onClick={() => isEditing && setIsModalOpen(true)}
                >
                    {(avatarPreview ||
                        (!removeProfileImage && group?.groupImage)) ? (
                        <img
                            src={avatarPreview || group?.groupImage}
                            alt="group"
                            className={`h-16 w-16 rounded-full object-cover ${isEditing ? "border-2 border-blue-500" : ""
                                }`}
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-700 text-white flex items-center justify-center text-2xl">
                            {group?.name?.charAt(0).toUpperCase() || "G"}
                        </div>
                    )}
                </div>
         
                <div className="p-2 border-b border-gray-200 dark:border-zinc-800 mt-1 flex justify-between items-center">
                    <div className="flex items-center gap-2 flex-1">
                        {isEditing ? (
                            <input
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded px-2 py-1 w-full"
                            />
                        ) : (
                            <h2 className="text-base font-semibold capitalize text-black dark:text-white">
                                {group?.name}
                            </h2>
                        )}

                        {isCurrentUserAdmin && (
                            <>
                                {isEditing ? (
                                    <Button
                                        size="small"
                                        type="primary"
                                        loading={updateGroupMutation.isPending}
                                        onClick={() => {
                                            updateGroupMutation.mutate({
                                                name: groupName,
                                                file: groupFile ?? undefined,
                                                removeImage: removeProfileImage,
                                            });
                                        }}
                                    >
                                        Update
                                    </Button>
                                ) : (
                                    <Button
                                        size="small"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {isCurrentUserAdmin && (
                        <Popconfirm
                            title="Delete the Group"
                            onConfirm={() => handleGroupDelete(Groups)}
                        >
                            <Button
                                danger
                                type="text"
                                icon={<Trash2 size={15} />}
                            />
                        </Popconfirm>
                    )}
                </div>

                <h2 className="text-xl font-semibold mt-3 mb-2 text-black dark:text-white">
                    Members
                </h2>

                <div className="mt-3 max-h-100 overflow-y-auto">
                    {group?.chatId?.participants?.map((user) => (
                        <GroupMember
                            key={user._id}
                            user={user}
                            currentUserId={userId}
                            status={userStatuses[user._id] || "offline"}
                            isUserAdmin={isUserAdmin}
                            isCurrentUserAdmin={isCurrentUserAdmin}
                            onRemoveAdmin={handleRemoveAdmin}
                            onChangeAdmin={handleChangeAdmin}
                            onDeleteMember={handleDelete}
                            isChangingAdmin={changeAdminMutation.isPending}
                        />
                    ))}
                </div>

                <div className="mt-3 flex justify-between items-center">
                    <Popconfirm
                        title="Exit the group?"
                        onConfirm={() => handleDelete(userId)}
                    >
                        <Button
                            type="primary"
                            className="bg-red-200! text-red-500!"
                        >
                            Exit
                        </Button>
                    </Popconfirm>

                    {isCurrentUserAdmin && (
                        <Button
                            type="primary"
                            className="bg-blue-200! text-blue-500!"
                            onClick={() =>
                                setOpenMember(!openAddMember ? true : false)
                            }
                        >
                            Add Member
                        </Button>
                    )}
                </div>

                {openAddMember && (
                    <AddMember
                        group={group}
                        onClose={() => setOpenMember(false)}
                    />
                )}
            </Modal>
            <ImageUpload
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                avatarPreview={avatarPreview || group?.groupImage || ""}
                user={{
                    profileImage: avatarPreview || group?.groupImage || "",
                }}
                fileInputRef={fileInputRef}
                handleRemoveProfileImage={handleRemoveProfileImage}
                removeProfileImage={removeProfileImage}
            />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
            />
        </>
    )
});

const GroupMember = memo(({
    user,
    currentUserId,
    status,
    isUserAdmin,
    isCurrentUserAdmin,
    onRemoveAdmin,
    onChangeAdmin,
    onDeleteMember,
    isChangingAdmin
}: {
    user: Participant,
    currentUserId: string | undefined,
    status: string,
    isUserAdmin: (id: string) => boolean,
    isCurrentUserAdmin: boolean,
    onRemoveAdmin: (id: string) => void,
    onChangeAdmin: (id: string) => void,
    onDeleteMember: (id: string) => void,
    isChangingAdmin: boolean
}) => {
    const isAdmin = isUserAdmin(user._id);
    return (
        <div
            className="p-2 border border-gray-200 dark:border-zinc-800 rounded bg-slate-100 dark:bg-zinc-800 mt-1 flex justify-between items-center"
        >
            <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center capitalize font-semibold">
                    {user.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={user.userName}
                            className="h-full w-full object-cover rounded-full"
                        />
                    ) : (
                        user.userName?.charAt(0)
                    )}

                    <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${status === "online"
                            ? "bg-green-500"
                            : status === "away"
                                ? "bg-yellow-400"
                                : "bg-red-500"
                            }`}
                    />
                </div>

                <div className="font-semibold capitalize text-black dark:text-white">
                    {user._id === currentUserId ? "You" : user.userName}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {isAdmin && (
                    <>
                        <span className="bg-blue-200 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 rounded">
                            admin
                        </span>

                        {isCurrentUserAdmin &&
                            user._id !== currentUserId && (
                                <Popconfirm
                                    title="Remove admin privileges?"
                                    onConfirm={() =>
                                        onRemoveAdmin(user._id)
                                    }
                                >
                                    <Button
                                        size="small"
                                        danger
                                        type="text"
                                        icon={<LogOut size={15} />}
                                        title="Remove from admin role"
                                    />
                                </Popconfirm>
                            )}
                    </>
                )}

                {!isAdmin && isCurrentUserAdmin && (
                    <>
                        <Popconfirm
                            title="Make this member the new admin?"
                            onConfirm={() =>
                                onChangeAdmin(user._id)
                            }
                        >
                            <Button
                                size="small"
                                loading={isChangingAdmin}
                                title="Make this member the new admin?"
                                type="text"
                                icon={<Ellipsis size={15} />}
                            />
                        </Popconfirm>

                        <Popconfirm
                            title="Remove member?"
                            onConfirm={() =>
                                onDeleteMember(user._id)
                            }
                        >
                            <Button
                                danger
                                type="text"
                                icon={<Trash2 size={15} />}
                            />
                        </Popconfirm>
                    </>
                )}
            </div>
        </div>
    );
});

export default ViewGroup;