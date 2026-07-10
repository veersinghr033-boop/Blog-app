import { toast } from "sonner"; 
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
            const response = await api.get("/users/all-data")
            const usersData = response.data?.users ?? [];

            return usersData.map((user: any) => ({
                id: user._id,
                name: user.userName,
            }))
        },
    })

    useEffect(() => {
        if (isError) {
            console.error("Error fetching users:", error)
            toast.error("Failed to fetch users")
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
            toast.success("Group created successfully");

        },
        onError: (error: any) => {
            toast.error(
                error?.response?.data?.message || "Failed to create group"
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
        createGroupMutation.mutate({ groupName, members: selectedMembers });
    };

    if (!open) return null

    return (
        <div className="fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative m-auto w-full max-w-md bg-white rounded shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Create New Group</h3>
                    <button onClick={onClose} className="text-gray-600">Close</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Group Name</label>
                        <input type="text" id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Enter group name" className="mt-1 p-2 outline-0 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Select Members</label>
                        <div className="mt-1 max-h-40 overflow-y-auto space-y-2 border border-gray-100 p-2 rounded-md">
                            {users.map((u) => (
                                <div key={u.id} className="flex items-center">
                                    <input type="checkbox" id={`member-${u.id}`} value={u.id} className="h-4 w-4" checked={selectedMembers.includes(u.id.toString())} onChange={(e) => setSelectedMembers((prev) => e.target.checked ? [...prev, u.id.toString()] : prev.filter((id) => id !== u.id.toString()))} />
                                    <label htmlFor={`member-${u.id}`} className="ml-2 block text-sm text-gray-900">{u.name}</label>
                                </div>
                            ))}
                            {users.length === 0 && <div className="text-center text-gray-500">No users available</div>}
                        </div>
                    </div>

                    <button type="submit" disabled={createGroupMutation.isPending} className="w-full bg-gray-800 text-white py-2 px-4 rounded-md">{createGroupMutation.isPending ? "Creating..." : "Create Group"}</button>
                </form>
            </div>
        </div>
    )
}

export default AddGroup;