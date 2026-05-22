"use client"

import { Modal, Typography } from "antd"

const { Title, Paragraph, Text } = Typography

interface BlogModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    blog: any
}

function BlogModal({
    open,
    setOpen,
    blog
}: BlogModalProps) {

    return (

        <Modal
            title="Blog Details"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
            width={700}
        >

            <div className="flex flex-col gap-4">

                <Title level={3}>
                    {blog?.title}
                </Title>

                <Paragraph>
                    {blog?.content}
                </Paragraph>

                <div className="flex items-center gap-3">

                    <div className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs uppercase">

                        {blog?.author?.name?.charAt(0)}

                    </div>

                    <Text>
                        {blog?.author?.name}
                    </Text>

                </div>

                <Text className="text-gray-500">

                    {blog?.createdAt &&
                        new Date(blog.createdAt).toLocaleDateString()
                    }

                </Text>

            </div>

        </Modal>
    )
}

export default BlogModal