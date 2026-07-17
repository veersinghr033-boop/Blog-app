// "use client";
import LexicalViewer from "@/hooks/lexicalViewer";
import Image from "next/image";

export default function BlogHeader({ blog }: { blog: any }) {
    return (
        <>

            <div className="max-h-135 overflow-auto whitespace-pre-line ">

             
                <div className="relative w-full max-w-10/12 h-110 mx-auto mb-4">
                    <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-lg w-full h-auto"
                    />
                </div>
                <LexicalViewer value={blog.content} />
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