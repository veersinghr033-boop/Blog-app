"use client";
import dynamic from "next/dynamic";

const CreateBlog = dynamic(
  () => import("@/components/ui/CreateBlog"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function Page() {
  return <CreateBlog />;
}