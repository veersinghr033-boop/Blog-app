import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/utills/axios";
import { toast } from "sonner";
interface User {
  id: string;
  name: string;
}

interface PropType {
  group: any;
  onClose: () => void;
}

function AddMember({ group, onClose }: PropType) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users/all-data");

      return response.data.map((user: any) => ({
        id: user._id,
        name: user.userName,
      }));
    },
  });

  const existingMemberIds =
    group?.chatId?.participants?.map((p: any) => p._id) || [];

  const rmainingUsers = users.filter(
    (user) => !existingMemberIds.includes(user.id),
  );

  const addMemberMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.put(`/groups/update-members/${group._id}`, {
        members: values.members,
      });
      console.log(res.data);
      return res.data;
    },
    onSuccess: () => {
      onClose();
      queryClient.invalidateQueries({
        queryKey: ["group", group._id],
      });
      toast.success("Members added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.toast || "Failed to add members");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      toast.warning("Please select at least one member");
      return;
    }
    addMemberMutation.mutate({ members: selectedMembers });
  };
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mt-3 mb-2 text-black dark:text-white">
        Add Members
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Members
        </label>

        <div className="mt-1 max-h-40 overflow-y-auto space-y-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 rounded-md">
          {rmainingUsers.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No users available to add
            </div>
          ) : (
            rmainingUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center"
              >
                <input
                  type="checkbox"
                  id={`member-${u.id}`}
                  value={u.id}
                  checked={selectedMembers.includes(u.id)}
                  onChange={(e) =>
                    setSelectedMembers((prev) =>
                      e.target.checked
                        ? [...prev, u.id]
                        : prev.filter(
                          (id) => id !== u.id
                        )
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                />

                <label
                  htmlFor={`member-${u.id}`}
                  className="ml-2 block text-sm text-gray-900 dark:text-white"
                >
                  {u.name}
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={addMemberMutation.isPending}
        className="w-full bg-black dark:bg-white text-white dark:text-black py-2 px-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-50"
      >
        {addMemberMutation.isPending
          ? "Adding..."
          : "Add"}
      </button>
    </form>
  );
}

export default AddMember;
