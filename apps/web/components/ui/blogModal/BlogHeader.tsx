// "use client";
import LexicalViewer from "@/hooks/lexicalViewer";


export default function BlogHeader({ blog }: { blog: any }) {
    return (
        <>

            <div className="max-h-135 overflow-auto whitespace-pre-line ">
                
                    <img
                        src={blog.image}
                        alt={blog.title}
                        className=" max-w-4/5   mx-auto object-cover rounded-lg mb-6 m-2 shadow-2xs shadow-gray-300"
                    />
                
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