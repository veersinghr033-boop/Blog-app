import { message ,Modal} from "antd";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/utills/axios";
import { useEffect, useState } from "react";

interface User {
    id: number;
    name: string;
};

function AddGroup({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const queryClient = useQueryClient();

    const {
        data: users = [],

        isError,
        error,
    } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await api.get("/users")

            return response.data.map((user: any) => ({
                id: user._id,
                name: user.userName,
            }))
        },
    })

    useEffect(() => {
        if (isError) {
            console.error("Error fetching users:", error)
            message.error("Failed to fetch users")
        }
    }, [isError, error])

    const createGroupMutation = useMutation({
        mutationFn: async (values: any) => {
            const res = await api.post("/groups/create", {
                groupName: values.groupName,
                members: values.members
            });
            console.log(res.data);
            return res.data;
        },
        onSuccess: () => {
            setGroupName("");
            setSelectedMembers([]);
            onClose();
            queryClient.invalidateQueries({
                queryKey: ["groups"]
            });
            message.success("Group created successfully");

        },
        onError: (error: any) => {
            message.error(
                error?.response?.data?.message || "Failed to create group"
            );
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) {
            message.warning("Group name cannot be empty");
            return;
        }
        if (selectedMembers.length === 0) {
            message.warning("Please select at least one member");
            return;
        }
        createGroupMutation.mutate({ groupName, members: selectedMembers });
    };

    return (
        <Modal
            title="Create New Group"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        htmlFor="groupName"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Group Name
                    </label>
                    <input
                        type="text"
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                        className="mt-1 p-2 outline-0 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Select Members
                    </label>
                    <div className="mt-1 max-h-40 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded-md">
                        {users.map((u) => (
                            <div key={u.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`member-${u.id}`}
                                    value={u.id}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    checked={selectedMembers.includes(
                                        u.id.toString(),
                                    )}
                                    onChange={(e) =>
                                        setSelectedMembers((prev) =>
                                            e.target.checked
                                                ? [...prev, u.id.toString()]
                                                : prev.filter(
                                                    (id) => id !== u.id.toString(),
                                                ),
                                        )
                                    }
                                />
                                <label
                                    htmlFor={`member-${u.id}`}
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    {u.name}
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
                    className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 disabled:opacity-50"
                >
                    {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                </button>
                </form>
        </Modal>
    );
}

export default AddGroup;