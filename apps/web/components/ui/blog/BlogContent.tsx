import { Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

export default function BlogContent({ post, expanded, onExpand, onOpen }: any) {
  return (
    <>
      <title >{post.title}</title>

      <Paragraph
        ellipsis={{
          rows: 3,
          onEllipsis: (value) => onExpand(post._id, value),
        }}
      >
        {post.content}
      </Paragraph>

      {expanded && (
        <text
          className="text-blue-500! cursor-pointer"
          onClick={() => onOpen(post)}
        >
          Read more
        </text>
      )}
    </>
  );
}
