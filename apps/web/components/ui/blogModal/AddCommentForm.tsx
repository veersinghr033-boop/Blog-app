import { Form, Input, Button, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utills/axios";

export default function AddCommentForm({ blogId }: { blogId: string }) {
    const [form] = Form.useForm();

    const queryClient = useQueryClient();
    const commentMutation = useMutation({
        mutationFn: async (values: any) => {
            await api.post(`/comments/${blogId}`, {
                comment: values.comment,
            });
        },

        onSuccess: () => {
            form.resetFields();

            queryClient.invalidateQueries({
                queryKey: ["comments", blogId],
            });
            queryClient.invalidateQueries({
                queryKey: ["blogData"],
            });
            queryClient.invalidateQueries({
                queryKey: ["blogs"],
            });
            queryClient.invalidateQueries({
                queryKey: ["saved"],
            });
            queryClient.invalidateQueries({
                queryKey: ["savedBlogs"],
            });
            queryClient.invalidateQueries({
                queryKey: ["blog"],
            });

            message.success("Comment added");
        },
    });

    const handleCommentSubmit = (values: any) => {
        commentMutation.mutate(values);
    };

    return (
        <Form form={form} layout="vertical" onFinish={handleCommentSubmit}>
            <Form.Item
                label="Add Comment"
                name="comment"
                rules={[
                    {
                        required: true,
                        message: "Please enter a comment",
                    },
                ]}
            >
                <Input placeholder="Write your comment..." required />
            </Form.Item>

            <Button
                type="primary"
                htmlType="submit"
                key="submit"
                loading={commentMutation.isPending}
            >
                Add Comment
            </Button>
        </Form>
    );
}
