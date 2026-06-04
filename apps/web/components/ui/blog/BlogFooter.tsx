import {
    EllipsisOutlined,
} from "@ant-design/icons";
import { Button, Typography } from "antd";
import BlogActions from "./BlogActions";

const { Text } = Typography;

export default function BlogFooter({
    post,
    onOpen,
}: any) {
    return (
        <div className="flex justify-between mt-4">
            <div className="flex items-center gap-2">
                <div className="bg-gray-700 text-white rounded-full w-7 h-7 flex items-center justify-center">
                    {post.author?.userName?.charAt(0)}
                </div>

                <Text>
                    {post.author?.userName}
                </Text>

                <BlogActions
                    post={post}
                    onOpen={onOpen}
                />
            </div>

            <div className="flex flex-col items-center gap-1">
                <Button
                    type="text"
                    icon={<EllipsisOutlined />}
                    onClick={() => onOpen(post)}
                />

                <Text title={post.createdAt ? new Date(post.createdAt).toLocaleString() : ""} className="text-gray-500 text-xs">
                    {new Date(
                        post.createdAt
                    ).toLocaleDateString()}
                </Text>
            </div>
        </div>
    );
}