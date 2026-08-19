// "use client";
import LexicalViewer from "@/hooks/lexicalViewer";
import { FileText } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

const BlogHeader = memo(({ blog }: { blog: any }) => {
    return (
        <>
            <div className="max-h-135 overflow-auto whitespace-pre-line text-black dark:text-white">
                {blog.image ? (
                    <div className="relative w-full max-w-10/12 h-110 mx-auto mb-4">
                        <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="rounded-lg w-full h-auto object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full h-48 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400">
                            <FileText />
                        </div>

                        <h3 className="mt-4 text-base font-medium text-gray-700 dark:text-gray-200 line-clamp-1 text-center px-5">
                            {blog.title}
                        </h3>

                        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                            Article Preview
                        </p>
                    </div>
                )}

                <LexicalViewer value={blog.content} />
            </div>

            <div
                className="flex items-center gap-3 mt-4"
                title={`Author: ${blog?.author?.userName}`}
            >
                <div className="bg-gray-700 dark:bg-zinc-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs uppercase">
                    {blog?.author?.userName?.charAt(0)}
                </div>

                <h2 className="text-black dark:text-white">
                    {blog?.author?.userName}
                </h2>
            </div>
        </>
    );
});

export default memo(BlogHeader);