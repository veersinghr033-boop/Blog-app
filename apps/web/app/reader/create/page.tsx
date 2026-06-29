"use client";

import { Layout, Form, Input, Button, message } from "antd";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function CreateBlog() {
  const [form] = Form.useForm();
  const router = useRouter();
  const queryClient = useQueryClient();

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
      form.resetFields();
      // router.push("/reader/blogs");
    },

    onError: (error) => {
      console.log(error);
      message.error("Failed to publish blog");
    },
  });

  const aiMutation = useMutation({
    mutationFn: async () => {
      const title = form.getFieldValue("title");

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
      form.setFieldsValue({
        content: data.content,
      });

      message.success("AI content generated");
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

  const handleSubmit = (values: {
    title: string;
    content: string;
  }) => {
    publishMutation.mutate(values);
  };

  return (
    <Layout className="min-h-screen bg-white">
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

      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="p-6!"
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            {
              required: true,
              message: "Please enter blog title",
            },
          ]}
        >
          <Input placeholder="Enter blog title" />
        </Form.Item>

        <Form.Item
          label="Content"
          name="content"
          rules={[
            {
              required: true,
              message: "Please enter blog content",
            },
          ]}
        >
          <Input.TextArea
            rows={12}
            placeholder="Write your blog content here..."
          />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-4 flex-wrap">
            <Button
              loading={aiMutation.isPending}
              onClick={() => aiMutation.mutate()}
            >
              Generate AI Content
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={publishMutation.isPending}
              className="bg-black!"
            >
              Publish
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Layout>
  );
}

export default CreateBlog;