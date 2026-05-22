"use client";

import { Layout, Form, Input, Button, message } from "antd";
import api from "@/utills/axios";
import { useAppSelector } from "@/lib/store/hooks";
import { useState } from "react";

function CreateBlog() {
  const [form] = Form.useForm();
  const userId = useAppSelector((state) => state.auth.user?.id);

  const [aiLoading, setAiLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // CREATE BLOG
  const handleSubmit = async (values: { title: string; content: string }) => {
    try {
      setPublishLoading(true);

      const response = await api.post("/blogs/create", {
        title: values.title,
        content: values.content,
        authorId: userId,
      });

      console.log("Blog created successfully:", response.data);

      message.success("Blog published successfully");

      form.resetFields();
    } catch (error) {
      console.error("Error creating blog:", error);

      message.error("Failed to publish blog");
    } finally {
      setPublishLoading(false);
    }
  };

  // GENERATE AI CONTENT
  const generateAIContent = async () => {
    try {
      const title = form.getFieldValue("title");

      if (!title) {
        return message.warning("Please enter title first");
      }

      setAiLoading(true);
      const prompt = `
Act as an expert SEO content writer and professional blogger.

Write a detailed, high-quality, SEO-friendly blog post about: "${title}"

Instructions:
- Use modern SEO best practices
- Include primary and secondary keywords naturally
- Create an attention-grabbing introduction
- Use clear and structured headings/subheadings
- Make the content informative, engaging, and easy to read
- Add statistics, examples, or trends if relevant
- Optimize for readability and Google ranking
- Include a short FAQ section with schema-style questions
- End with a strong conclusion and CTA

Content Style:
- Human-like writing
- Professional tone
- Conversational and engaging
- Avoid keyword stuffing
- Use short paragraphs and readable formatting

Generate:
1. SEO Title
2. Meta Description
3. Slug URL
4. Focus Keywords
5. Full Blog Article in Markdown
6. FAQs
7. Conclusion

Topic: ${title}
`;

      const response = await api.post("/openai/generate", {
        prompt,
      });

      form.setFieldsValue({
        content: response.data.content,
      });

      message.success("AI content generated");
    } catch (error) {
      console.log(error);

      message.error("Failed to generate AI content");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-white">
      <header className="flex flex-col w-full gap-4 border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-2xl font-semibold">Create Blog</h2>

          <p className="text-gray-500">Write and publish your blog posts</p>
        </div>
      </header>

      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        className="p-6!"
      >
        {/* TITLE */}
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

        {/* CONTENT */}
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
            {/* AI GENERATE */}
            <Button loading={aiLoading} onClick={generateAIContent}>
              Generate AI Content
            </Button>

            {/* SAVE DRAFT */}
            <Button>Save Draft</Button>

            {/* PUBLISH */}
            <Button
              type="primary"
              htmlType="submit"
              loading={publishLoading}
              className="bg-gray-800"
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
