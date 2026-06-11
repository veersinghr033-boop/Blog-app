import { Modal, Button, Popconfirm, message, Checkbox, Form } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";
interface User {
  id: string;
  name: string;
}

interface PropType {
  group: any;
  onClose: () => void;
}

function AddMember({ group, onClose }: PropType) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users");

      return response.data.map((user: any) => ({
        id: user._id,
        name: user.userName,
      }));
    },
  });

  const existingMemberIds =
    group?.chatId?.participants.map((p: any) => p._id) || [];

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
      form.resetFields();
      onClose();
      queryClient.invalidateQueries({
        queryKey: ["group", group._id],
      });
      message.success("Members added successfully");
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Failed to add members");
    },
  });

  const handleSubmit = (values: any) => {
    console.log("values", values);
    addMemberMutation.mutate(values);
  };
  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      <h2 className="text-xl font-semibold mt-3 mb-2">Add Members</h2>
      <Form.Item
        label="Select Members"
        name="members"
        rules={[
          { required: true, message: "Please select at least one member" },
        ]}
      >
        <Checkbox.Group style={{ width: "100%" }}>
          {rmainingUsers.length === 0 ? (
            <div className="text-center text-gray-500">
              No users available to add
            </div>
          ) : (
            rmainingUsers.map((u) => (
              <Checkbox key={u.id} value={u.id} style={{ marginBottom: 8 }}>
                {u.name}
              </Checkbox>
            ))
          )}
        </Checkbox.Group>
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        // loading={createGroupMutation.isPending}
        className="w-full bg-black!"
      >
        Add
      </Button>
    </Form>
  );
}

export default AddMember;
