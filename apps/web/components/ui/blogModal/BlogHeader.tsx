"use client";
import LexicalContentRenderer from "../../lexical/LexicalContentRenderer";


export default function BlogHeader({ blog }: { blog: any }) {
    return (
        <>

            <div className="max-h-80 overflow-auto whitespace-pre-line">
                <LexicalContentRenderer content={blog.content} />
            </div>

            <div className="flex items-center gap-3" title={"Author: " + blog?.author?.userName}>
                <div className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs uppercase">
                    {blog?.author?.userName?.charAt(0)}
                </div>

                <h2>{blog?.author?.userName}</h2>
            </div>
        </>
    );
}