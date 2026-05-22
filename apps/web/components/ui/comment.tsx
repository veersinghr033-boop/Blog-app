"use client"

import { Modal, Form, Input, Button, message } from "antd"
import { useAppDispatch ,useAppSelector } from "@/lib/store/hooks"
import { fetchComments } from "@/lib/store/features/commentThunk"
import { useEffect } from "react"
import api from "@/utills/axios"

interface CommentModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    blogId: string
    user: any
}

function CommentModal({
    open,
    setOpen,
    blogId,
    user
}: CommentModalProps) {

    const [form] = Form.useForm()
    const dispatch = useAppDispatch()
    const comments = useAppSelector((state) => state.comment.comments)
    useEffect(() => {
        if (blogId) {
            dispatch(fetchComments(blogId) as any)
        }
    }, [dispatch, blogId])

    const handleSubmit = async (values: any) => {

        try {

            await api.post(`/comments/${blogId}`, {
                comment: values.comment,
                userId: user
            })

            message.success("Comment added successfully")

            form.resetFields()

            setOpen(false)

        } catch (error) {

            console.error("Error adding comment:", error)

            message.error("Failed to add comment")
        }
    }
    return (

        <Modal
            title="Add Comment"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
        >

           {comments.map((comment) => (
                <div key={comment._id} className="mb-4 p-3 border border-gray-300 rounded">
                    <p className="text-sm text-gray-600">
                        {comment.user.name} - {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    <p>{comment.comment}</p>
                </div>
            ))}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >

                <Form.Item
                    label="Comment"
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