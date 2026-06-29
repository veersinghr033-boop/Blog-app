import React from "react";


function BlogContent({ post, onOpen }: any) {
  const showReadMore = post.content?.length > 150;

  return (
    <>
      <h2 className="font-semibold text-2xl mb-2">{post.title}</h2>

      <p className="line-clamp-3">
        {post.content}
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
// function BlogContent({ post, onOpen }: any) {
//   const showReadMore = post.content?.length > 150;

//   return (
//     <>
//       <h2 className="font-semibold text-2xl mb-2">{post.title}</h2>

//       <p className="line-clamp-3">
//         {post.content}
//       </p>

//       {showReadMore && (
//         <span
//           className="text-blue-500 cursor-pointer"
//           onClick={() => onOpen(post._id)}
//         >
//           Read more
//         </span>
//       )}
//     </>
//   );
// }