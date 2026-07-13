import { memo, useCallback } from "react";

import { useRouter } from "next/navigation";
import { ThumbsUp, MessageCircle, Save } from "lucide-react";

interface ReaderBlogCardProps {
    post: any;
    userId: string;
    isSaved: boolean;

    onLike: (blogId: string) => void;
    onSave: (
        blogId: string,
        isSaved: boolean
    ) => void;
    onView: (blogId: string) => void;
}
function ReaderBlogCard({
    post,
    userId,
    isSaved,
    onLike,
    onSave,
    onView,
}: ReaderBlogCardProps) {
    const isLiked = post.isLiked;
    const isCommented = post.isCommented;
    const router = useRouter()


    const openBlogModal = useCallback(
        (blogOrId: any) => {
            const blogId = typeof blogOrId === "string" || typeof blogOrId === "number"
                ? blogOrId
                : blogOrId?._id || blogOrId?.id;

            if (!blogId) {
                console.warn("Missing blog id", blogOrId);
                return;
            }

            router.push(`/user/blogs/${blogId}`);

            requestIdleCallback(() => {
                onView(blogId);
            });
        },
        [router, onView]
    );
    // const getTextFromLexical = (content: any): string => {
    //     if (!content?.root?.children) return "";

    //     const extract = (nodes: any[]): string => {
    //         return nodes
    //             .map((node) => {
    //                 if (node.text) return node.text;

    //                 if (node.children) {
    //                     return extract(node.children);
    //                 }

    //                 return "";
    //             })
    //             .join(" ");
    //     };

    //     return extract(content.root.children);
    // };
    const showReadMore = post.preview?.length > 150;

    return (
        <div className="h-full rounded-lg border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow border-gray-200 shadow-sm">
            <div className="flex h-full flex-col gap-4">
                <div>
                    {post.image && (
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-48 object-cover rounded-lg mb-6"
                        />
                    )}
                    <h2 className="font-normal text-2xl mb-2  line-clamp-2">
                        {post.title}
                    </h2>
                   
                    <p className="line-clamp-3">
                        {post.preview}
                    </p>

                    {showReadMore && (
                        <span
                            className="text-blue-500 cursor-pointer"
                            onClick={() => openBlogModal(post._id)}
                        >
                            Read more
                        </span>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs uppercase text-white">
                                {post.author?.userName?.charAt(0) || "U"}
                            </div>
                            <span>{post.author?.userName || "Unknown"}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <span
                                className={`flex items-center gap-1 cursor-pointer transition-colors ${isLiked ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
                                onClick={() => onLike(post._id)}
                            >
                                <ThumbsUp size={15} /> {post.likes?.count || 0}
                            </span>
                            <span
                                className={`flex items-center gap-1 cursor-pointer transition-colors ${isCommented ? "text-green-500" : "text-gray-500 hover:text-green-500"}`}
                                onClick={() => openBlogModal(post._id)}
                            >
                                <MessageCircle size={15} /> {post.comments?.count || 0}
                            </span>
                            <span className="text-sm cursor-pointer hover:text-blue-500 text-gray-500">
                                {post.views?.count || 0} Views
                            </span>
                        </div>
                        <button
                            className={`cursor-pointer text-lg transition-colors ${isSaved ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`}
                            onClick={() =>
                                onSave(post._id, isSaved)
                            }
                            title={isSaved ? "Unsave" : "Save"}
                        >
                            <Save size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(ReaderBlogCard);
