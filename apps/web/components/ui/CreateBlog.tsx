
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const Upload = dynamic(() => import("antd/es/upload/Upload"), { ssr: false });
const Editor = dynamic(
  () => import("@/components/lexical/Editor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-60 border rounded animate-pulse" />
    ),
  }
);
function CreateBlog() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<{
    title: string;
    content: string | null;
  }>({
    title: "",
    content: null,
  });
  const [editorKey, setEditorKey] = useState(0);
  const userId = useAppSelector((state) => state.auth.user?._id);
  const [editorContent, setEditorContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const publishMutation = useMutation({
    mutationFn: async (values: { title: string; content: any }) => {
      const payload: Record<string, any> = {
        title: values.title,
        content: values.content,
      };

      // if (image) {
        const data = new FormData();
        data.append("title", values.title);
        data.append("content", JSON.stringify(values.content));
        if (image) {
          data.append("image", image);
        }

        const response = await api.post("/blogs/create", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return response.data;
      // } else {
      //   toast.warning("Please upload an image");
      //   return;
      // }


    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogData"] });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      toast.success("Blog published successfully");
      setFormData({
        title: "",
        content: null,
      });
      setEditorContent("");
      setEditorKey((prev) => prev + 1);
      setImage(null);
      setPreview("");
    },

    onError: (error) => {
      console.log(error);
      toast.error("Failed to publish blog");
    },
  });
  const formatContent = (text: string) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let html = "";
    let inUl = false;
    let inOl = false;

    lines.forEach((line, index) => {
      if (index === 0) {
        html += `<h2>${line}</h2>`;
        return;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!inUl) {
          html += "<ul>";
          inUl = true;
        }

        if (inOl) {
          html += "</ol>";
          inOl = false;
        }

        html += `<li>${line.replace(/^[-*]\s/, "")}</li>`;
        return;
      }

      if (/^\d+\./.test(line)) {
        if (!inOl) {
          html += "<ol>";
          inOl = true;
        }

        if (inUl) {
          html += "</ul>";
          inUl = false;
        }

        html += `<li>${line.replace(/^\d+\.\s*/, "")}</li>`;
        return;
      }

      if (inUl) {
        html += "</ul>";
        inUl = false;
      }

      if (inOl) {
        html += "</ol>";
        inOl = false;
      }

      if (
        line.length < 60 &&
        !line.endsWith(".") &&
        !line.endsWith(",") &&
        !line.endsWith(":")
      ) {
        html += `<h3>${line}</h3>`;
        return;
      }

      html += `<p>${line}</p>`;
    });

    if (inUl) html += "</ul>";
    if (inOl) html += "</ol>";

    return html;
  };
  const aiMutation = useMutation({
    mutationFn: async () => {
      const title = formData.title;

      if (!title) {
        throw new Error("Please enter title first");
      }

      const prompt = `
Write a simple, human-like blog post about the given topic.

Requirements:
- Around 500 words only
- Use simple and clear language
- Conversational and natural tone
- Do NOT use markdown headings like # or ##
- Use plain text headings only
- Include:
  - Introduction
  - 2 to 3 section headings
  - ordered or unordered lists if necessary in advantages or disadvantages sections
  - Main content
  - Conclusion
- Keep paragraphs short
- Make the article informative and engaging
- No SEO optimization
- No FAQs
- No meta description or slug
- Return clean text only

Topic: ${title}
`;

      const response = await api.post("/openai/generate", {
        prompt,
      });

      return response.data;
    },
    onSuccess: (data) => {
      const html = formatContent(data.content);

      setEditorContent(html);

      setFormData((prev) => ({
        ...prev,
        content: html,
      }));
      toast.success("AI content generated successfully");
    },

    onError: (error: any) => {
      console.log(error);

      if (error.message === "Please enter title first") {
        toast.warning(error.message);
      } else {
        toast.error("Failed to generate AI content");
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const isContentEmpty = (content: any) => {
    if (!content?.root?.children?.length) return true;

    const text = content.root.children
      .flatMap((node: any) => node.children || [])
      .map((child: any) => child.text || "")
      .join("")
      .trim();

    return text.length === 0;
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = formData.title.trim();
    const content = formData.content;


    if (!title) {
      toast.warning("Please enter title first");
      return;
    }
    if (isContentEmpty(formData.content)) {
      toast.warning("Please enter content first");
      return;
    } 
    // if (!image) {
    //   toast.warning("Please upload an image");
    //   return;
    // }

    publishMutation.mutate({ title, content });
  };

  return (
    <div className="min-h-screen ">
      <header className="flex flex-col w-full gap-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold">Create Blog</h2>

          <p className="text-gray-500">Write and publish your blog posts</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
            className="mt-1 p-2 outline-0 block w-full rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Blog Image</label>


          <Upload
            accept="image/*"
            maxCount={1}
            listType="picture-card"
            showUploadList={false}
            beforeUpload={(file) => {
              setImage(file);
              setPreview(URL.createObjectURL(file));
              return false;
            }}
          >
            {preview ? (
              <Image
                src={preview}
                alt="preview"
                width={200}
                height={200}
                className="h-full w-full object-cover"
              />
            ) : (
              <div>
                <Plus size={18} />                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Content</label>

          <Editor
            key={editorKey}
            initialContent={editorContent}
            onChange={(html) =>
              setFormData((prev) => ({
                ...prev,
                content: html,
              }))
            }
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <button
            type="button"
            disabled={aiMutation.isPending}
            onClick={() => aiMutation.mutate()}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50"
          >
            Generate AI Content
          </button>

          <button
            type="submit"
            disabled={publishMutation.isPending}
            className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateBlog;
