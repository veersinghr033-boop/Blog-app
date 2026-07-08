"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/utills/axios";
import ReadBlog from "@/components/ui/blogModal/BlogModal";

export default function BlogDetailsPage() {
  const params = useParams();

  const { data: blog, error } = useQuery({
    queryKey: ["blog", params.id],
    queryFn: async () => {
      const res = await api.get(`/blogs/find/${params.id}`);
      return res.data.blog;
    },
  });

  if (error) {
    console.error("Error fetching blog:", error);
    return <div>Error occurred while fetching blog</div>;
  }

  if (!blog) {
    return <div>Blog not found</div>;
  }

  return <ReadBlog blog={blog} />;
}
