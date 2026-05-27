"use client"

import { Modal, Form, Button, Input, message } from "antd"
import { useMutation } from "@tanstack/react-query"
import api from "@/utills/axios"

interface ReportModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    blogId: string
}

function ReportModal({
    open,
    setOpen,
    blogId,
}: ReportModalProps) {
    const [form] = Form.useForm()

    const reportMutation = useMutation({
        mutationFn: async (reason: string) => {
            return await api.post("/reports", {
                blogId,
                reason,
            })
        },

        onSuccess: () => {
            message.success("Blog reported successfully")

            form.resetFields()
            setOpen(false)
        },

        onError: (error) => {
            console.error("Error reporting blog:", error)
            message.error("Failed to report blog")
        },
    })

    const handleSubmit = (values: { reason: string }) => {
        reportMutation.mutate(values.reason)
    }

    return (
        <Modal
            title="Report Blog"
            open={open}
            onCancel={() => {
                form.resetFields()
                setOpen(false)
            }}
            footer={null}
        >
            <div className="flex flex-col gap-4">
                <p>
                    Are you sure you want to report this blog?
                </p>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Reason"
                        name="reason"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please provide a reason",
                            },
                            {
                                min: 10,
                                message:
                                    "Reason must be at least 10 characters",
                            },
                        ]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Please provide a reason for reporting this blog"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex gap-2">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={reportMutation.isPending}
                            >
                                Yes, Report
                            </Button>

                            <Button
                                onClick={() => {
                                    form.resetFields()
                                    setOpen(false)
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    )
}

export default ReportModal