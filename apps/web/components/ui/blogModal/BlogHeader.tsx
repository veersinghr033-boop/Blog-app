// "use client";
import LexicalViewer from "@/hooks/lexicalViewer";
import Image from "next/image";

export default function BlogHeader({ blog }: { blog: any }) {
    return (
        <>
            <div className="max-h-135 overflow-auto whitespace-pre-line text-black dark:text-white">
                <div className="relative w-full max-w-10/12 h-110 mx-auto mb-4">
                    <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-lg w-full h-auto object-cover"
                    />
                </div>

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
}