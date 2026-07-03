"use client";

import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { message } from "antd";

function CreateBlog() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const userId = useAppSelector((state) => state.auth.user?.id);

  const publishMutation = useMutation({
    mutationFn: async (values: {
      title: string;
      content: string;
    }) => {
      const response = await api.post("/blogs/create", {
        title: values.title,
        content: values.content,
        authorId: userId,
      });

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogData"] });
      message.success("Blog published successfully");
      setFormData({
        title: "",
        content: "",
      });
    },

    onError: (error) => {
      console.log(error);
      message.error("Failed to publish blog");
    },
  });

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
  - Title
  - Introduction
  - 2 to 3 section headings
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
      setFormData((current) => ({
        ...current,
        content: data.content,
      }));
      message.success("AI content generated successfully");
    },

    onError: (error: any) => {
      console.log(error);

      if (error.message === "Please enter title first") {
        message.warning(error.message);
      } else {
        message.error("Failed to generate AI content");
      }
    },
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    publishMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen ">
      <header className="flex flex-col w-full gap-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold">
            Create Blog
          </h2>

          <p className="text-gray-500">
            Write and publish your blog posts
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            placeholder="Write your blog content here..."
            className="mt-1 p-2 outline-0 block bg-white font-medium text-sm  rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full"
            required
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