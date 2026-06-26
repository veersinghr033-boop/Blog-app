import { Card } from "antd";
import BlogFooter from "./BlogFooter";
import BlogContent from "./BlogContent";
import React from "react";

interface BlogCardProps {
  post: any;
  expanded: boolean;
  onExpand: (id: string, value: boolean) => void;
  onOpen: (blog: any) => void;
}

 function BlogCard({
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

      <BlogFooter post={post} onOpen={onOpen} />
    </Card>
  );
}
export default React.memo(BlogCard);