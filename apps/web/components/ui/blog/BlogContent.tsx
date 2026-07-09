
// "use client";/

import React from "react";


function BlogContent({ post, onOpen }: any) {
  const getTextFromLexical = (content: any): string => {
    if (!content?.root?.children) return "";

    const extract = (nodes: any[]): string => {
      return nodes
        .map((node) => {
          if (node.text) return node.text;

          if (node.children) {
            return extract(node.children);
          }

          return "";
        })
        .join(" ");
    };

    return extract(content.root.children);
  };
  const textContent = getTextFromLexical(post.content);

  const showReadMore = textContent.length > 150;

  return (
    <>
      <h2 className="font-normal text-2xl mb-2">{post.title}</h2>

      <p className="line-clamp-3">
        {textContent.slice(0, 400)}
      </p>

      {showReadMore && (
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() => onOpen(post._id)}
        >
          Read more
        </span>
      )}
    </>
  );
}
export default React.memo(BlogContent);
