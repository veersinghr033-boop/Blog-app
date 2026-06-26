import { Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

export default function BlogHeader({ blog }: { blog: any }) {
    return (
        <>
            <title >{blog?.title}</title>

            <Paragraph className="max-h-80 overflow-auto whitespace-pre-line">
                {blog?.content}
            </Paragraph>

            <div className="flex items-center gap-3" title={"Author: " + blog?.author?.userName}>
                <div className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs uppercase">
                    {blog?.author?.userName?.charAt(0)}
                </div>

                <text>{blog?.author?.userName}</text>
            </div>
        </>
    );
}