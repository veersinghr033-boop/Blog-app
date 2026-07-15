import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageCircle, Save } from "lucide-react";
import Image from "next/image";

interface ReaderBlogCardProps {
    index: number;
    post: any;
    userId: string;
    isSaved: boolean;
    onLike: (blogId: string) => void;
    onSave: (blogId: string, isSaved: boolean) => void;
    onView: (blogId: string) => void;
}

function ReaderBlogCard({
    index,
    post,
    isSaved,
    onLike,
    onSave,
    onView,
}: ReaderBlogCardProps) {
    const router = useRouter();

    const isLiked = post.isLiked;
    const isCommented = post.isCommented;
    const blogId = post._id;

    const openBlogModal = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const id = blogId;
            if (!id) return;

            router.push(`/user/blogs/${id}`);
            router.prefetch(`/user/blogs/${id}`);

            if (typeof requestIdleCallback !== "undefined") {
                requestIdleCallback(() => onView(id));
            } else {
                setTimeout(() => onView(id), 100);
            }
        },
        [router, onView, blogId]
    );

    const handleLike = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onLike(blogId);
        },
        [onLike, blogId]
    );

    const handleSave = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onSave(blogId, isSaved);
        },
        [onSave, blogId, isSaved]
    );

    const authorInitial = useMemo(
        () => post.author?.userName?.charAt(0)?.toUpperCase() || "U",
        [post.author?.userName]
    );

    const formattedDate = useMemo(
        () => (post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""),
        [post.createdAt]
    );

    const showReadMore = post.preview?.length > 150;

    const isPriority = post.index < 3;

    return (
        <div className="h-full rounded-lg border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow border-gray-200 shadow-sm">
            <div className="flex h-full flex-col gap-4">
                <div>
                    {post.image && (
                        <div className="relative w-full h-48 mb-6">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                sizes="(max-width:768px)100vw,33vw"
                                className="object-cover rounded-lg"
                            />
                        </div>
                    )}
                    <h2 className="font-normal text-2xl mb-2 line-clamp-2">
                        {post.title}
                    </h2>

                    <p className="line-clamp-3 text-gray-700">{post.preview}</p>

                    {showReadMore && (
                        <button
                            className="text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
                            onClick={openBlogModal}
                        >
                            Read more
                        </button>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {post.author?.profileImage ? (
                                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                                    <Image
                                        src={post.author.profileImage}
                                        alt={post.author.userName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center capitalize font-semibold">
                                    {authorInitial}
                                </div>
                            )}
                            <span className="text-sm font-medium">
                                {post.author?.userName || "Unknown"}
                            </span>
                        </div>
                        <time className="text-xs text-gray-400" dateTime={post.createdAt}>
                            {formattedDate}
                        </time>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <button
                                className={`flex items-center gap-1 transition-colors ${isLiked ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
                                    }`}
                                onClick={handleLike}
                                aria-label={isLiked ? "Unlike post" : "Like post"}
                            >
                                <ThumbsUp size={15} />
                                <span>{post.likes?.count || 0}</span>
                            </button>

                            <button
                                className={`flex items-center gap-1 transition-colors ${isCommented ? "text-green-500" : "text-gray-500 hover:text-green-500"
                                    }`}
                                onClick={openBlogModal}
                                aria-label="View comments"
                            >
                                <MessageCircle size={15} />
                                <span>{post.comments?.count || 0}</span>
                            </button>

                            <span className="text-sm text-gray-500">
                                {post.views?.count || 0} Views
                            </span>
                        </div>

                        <button
                            className={`cursor-pointer transition-colors ${isSaved ? "text-blue-500" : "text-gray-400 hover:text-blue-500"
                                }`}
                            onClick={handleSave}
                            aria-label={isSaved ? "Unsave blog" : "Save blog"}
                        >
                            <Save size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(ReaderBlogCard, (prevProps, nextProps) => {
    return (
        prevProps.post._id === nextProps.post._id &&
        prevProps.post.isLiked === nextProps.post.isLiked &&
        prevProps.post.likes?.count === nextProps.post.likes?.count &&
        prevProps.isSaved === nextProps.isSaved &&
        prevProps.post.comments?.count === nextProps.post.comments?.count
    );
});