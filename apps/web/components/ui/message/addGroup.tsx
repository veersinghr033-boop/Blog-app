import { Modal, Checkbox, Form, Button, message, Input } from "antd";
import { useMutation } from "@tanstack/react-query";
import api from "@/utills/axios";

type User = {
    id: number;
    name: string;
};

function AddGroup({
    open,
    onClose,
    user,
}: {
    open: boolean;
    onClose: () => void;
    user: User[];
}) {
    const [form] = Form.useForm();

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
            form.resetFields();
            onClose();
            message.success("Group created successfully");
        },
        onError: (error: any) => {
            message.error(
                error?.response?.data?.message || "Failed to create group"
            );
        },
    });

    const handleSubmit = (values: any) => {
        createGroupMutation.mutate(values);
    };

    return (
        <Modal title="Create New Group" open={open} onCancel={onClose} footer={null}>
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                <Form.Item label="Group Name" name="groupName" rules={[{ required: true, message: "Please enter a group name" }]}>
                    <Input placeholder="Enter group name" />
                </Form.Item>

                <Form.Item label="Select Members" name="members" rules={[{ required: true, message: "Please select at least one member" }]}>
                    <Checkbox.Group style={{ width: "100%" }}>
                        {user.map((u) => (
                            <Checkbox key={u.id} value={u.id} style={{ marginBottom: 8 }}>
                                {u.name}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    loading={createGroupMutation.isPending}
                    className="w-full"
                >
                    Create Group
                </Button>
            </Form>
        </Modal>
    );
}

export default AddGroup;