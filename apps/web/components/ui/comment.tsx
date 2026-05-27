"use client"

import { Modal, Form, Input, Button, message } from "antd"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fetchComments } from "@/lib/store/features/commentThunk"
import { useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import api from "@/utills/axios"

interface CommentModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    blogId: string
}

function CommentModal({
    open,
    setOpen,
    blogId,
}: CommentModalProps) {

    const [form] = Form.useForm()
    const dispatch = useAppDispatch()
    const comments = useAppSelector((state) => state.comment.comments)
    useEffect(() => {
        if (blogId) {
            dispatch(fetchComments(blogId) as any)
        }
    }, [dispatch, blogId])
    const CommentMutation = useMutation({
        mutationFn: async (values: any) => {
            await api.post(`/comments/${blogId}`, {
                comment: values.comment,
            })
        },
        onSuccess: () => {
            message.success("Comment added successfully")
            form.resetFields()
            setOpen(false)
        },
        onError: (error) => {
            console.error("Error adding comment:", error)
            message.error("Failed to add comment")
        }
    })

    const handleSubmit = async (values: any) => {
        CommentMutation.mutate(values)
    }
    return (

        <Modal
            title="Comments"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
        >

            {comments.map((comment) => (
                <div key={comment._id} className="mb-4 p-3 space-y-2 border border-gray-300 rounded">
                    <div className="text-sm flex items-center gap-2 text-gray-600">

                        <div className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs uppercase">
                            {comment.user.name.charAt(0)}
                        </div>


                        {comment.user.name} - {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                    <p className="text-gray-600 pl-4 ">{comment.comment}</p>
                </div>
            ))}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >

                <Form.Item
                    label="Add Comment"
                    name="comment"
                    rules={[
                        {
                            required: true,
                            message: "Please enter your comment"
                        }
                    ]}
                >

                    <Input.TextArea
                        rows={4}
                        placeholder="Write your comment here..."
                    />

                </Form.Item>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                >
                    Send Comment
                </Button>

            </Form>

        </Modal>
    )
}

export default CommentModal