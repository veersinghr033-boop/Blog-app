
import { Card } from "antd";
import BlogFooter from "./BlogFooter";
import BlogContent from "./BlogContent";

interface BlogCardProps {
    post: any;
    expanded: boolean;
    onExpand: (id: string, value: boolean) => void;
    onOpen: (blog: any) => void;
}

export default function BlogCard({
    post,
    expanded,
    onExpand,
    onOpen,
}: BlogCardProps) {
    return (
        <Card hoverable className="w-full rounded-2xl">
            <BlogContent
                post={post}
                expanded={expanded}
                onExpand={onExpand}
                onOpen={onOpen}
            />

            <BlogFooter
                post={post}
                onOpen={onOpen}
            />
        </Card>
    );
}