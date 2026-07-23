import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, MessageCircle, Save, FileText} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ViewProfile from "../ViewProfile";
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
  const [isOpen, setIsOpen] = useState(false);

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

    const isPriority = index < 3;

    return (
        <div className="h-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow">
            <div className="flex h-full flex-col gap-4">
                <div>
                    {post.image ? (
                        <div className="relative w-full h-48 mb-6">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                priority={isPriority}
                                fetchPriority={index === 0 ? "high" : undefined}
                                sizes="
(max-width:768px) 100vw,
(max-width:1200px) 50vw,
33vw
"
                                className="object-cover rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-48 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400">
                                <FileText />
                            </div>

                            <h3 className="mt-4 text-base font-medium text-gray-700 dark:text-gray-200 line-clamp-1 text-center px-5">
                                {post.title}
                            </h3>

                            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                                Article Preview
                            </p>
                        </div>
                    )}

                    <h2 className="font-normal text-2xl mb-2 line-clamp-2 text-black dark:text-white">
                        {post.title}
                    </h2>

                    <p className="line-clamp-3 text-gray-700 dark:text-gray-300">
                        {post.preview}
                    </p>

                    {showReadMore && (
                        <button
                            className="text-blue-500 hover:text-blue-400 font-medium cursor-pointer"
                            onClick={openBlogModal}
                        >
                            Read more
                        </button>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsOpen(true)}>
                            {post.author?.profileImage ? (
                                <div className="relative h-12 w-12">
                                    <Image
                                        src={post.author.profileImage}
                                        alt={post.author.userName}
                                        fill
                                        sizes="48px"
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center capitalize font-semibold">
                                    {authorInitial}
                                </div>
                            )}

                            <span className="text-sm font-medium text-black dark:text-white">
                                {post.author?.userName || "Unknown"}
                            </span>
                        </div>

                        <time
                            className="text-xs text-gray-400 dark:text-gray-500"
                            dateTime={post.createdAt}
                        >
                            {formattedDate}
                        </time>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <button
                                className={`flex items-center gap-1 transition-colors ${isLiked
                                        ? "text-blue-500"
                                        : "text-gray-500 dark:text-gray-400 hover:text-blue-500"
                                    }`}
                                onClick={handleLike}
                                aria-label={isLiked ? "Unlike post" : "Like post"}
                            >
                                <ThumbsUp size={15} />
                                <span>{post.likes?.count || 0}</span>
                            </button>

                            <button
                                className={`flex items-center gap-1 transition-colors ${isCommented
                                        ? "text-green-500"
                                        : "text-gray-500 dark:text-gray-400 hover:text-green-500"
                                    }`}
                                onClick={openBlogModal}
                                aria-label="View comments"
                            >
                                <MessageCircle size={15} />
                                <span>{post.comments?.count || 0}</span>
                            </button>

                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {post.views?.count || 0} Views
                            </span>
                        </div>

                        <button
                            className={`cursor-pointer transition-colors ${isSaved
                                    ? "text-blue-500"
                                    : "text-gray-400 dark:text-gray-500 hover:text-blue-500"
                                }`}
                            onClick={handleSave}
                            aria-label={isSaved ? "Unsave blog" : "Save blog"}
                        >
                            <Save size={20} />
                        </button>
                    </div>
                </div>
            </div>
            {isOpen && (
                <ViewProfile
                    userId={post.author?.id}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                />
            )}
        </div>
    );
}

export default memo(ReaderBlogCard )