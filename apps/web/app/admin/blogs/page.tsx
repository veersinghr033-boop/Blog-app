"use client";
import dynamic from "next/dynamic";

const Blog = dynamic(
  () => import("@/components/ui/blog/Blog"),
  {
    loading: () => <div>Loading...</div>,
  }
); import { useMemo, useState } from "react";
import api from "@/utills/axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks";

function Blogs() {
  // const [searchText, setSearchText] = useState("");
  // const [statusFilter, setStatusFilter] = useState("");

  const userId = useAppSelector((state) => state.auth.user?._id);

  const role = useAppSelector((state) => state.auth.user?.role);
  // const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  //   useInfiniteQuery({
  //     queryKey: ["blogs"],

  //     queryFn: async ({ pageParam }) => {
  //       const before = pageParam ? `?before=${pageParam}` : "";

  //       const res = await api.get(`/blogs/all${before}`);

  //       return res.data;
  //     },

  //     initialPageParam: null,

  //     getNextPageParam: (lastPage) =>
  //       lastPage.hasMore ? lastPage.nextCursor : undefined,
  //     staleTime: 60_000,
  //     gcTime: 10 * 60_000,
  //     refetchOnWindowFocus: false,
  //   });
  // const blogs = data?.pages.flatMap((page) => page.blogs) ?? [];
  // const filteredBlogs = useMemo(() => {
  //   return blogs.filter((blog: any) => {
  //     const matchesSearch =
  //       blog.title?.toLowerCase().includes(searchText.toLowerCase()) ||
  //       blog.description?.toLowerCase().includes(searchText.toLowerCase());

  //     const matchesStatus =
  //       statusFilter === "" || blog.status?.toLowerCase() === statusFilter;

  //     return matchesSearch && matchesStatus;
  //   });
  // }, [blogs, searchText, statusFilter]);

  return (
    <div className="min-h-screen ">
      <header className="w-full border-b border-gray-200 px-4 py-4">
        <div>
          <h2 className="text-2xl font-semibold">Blogs Management</h2>

          <p className="text-gray-500">Manage platform blogs and content</p>
        </div>

        {/* <input
          className="w-full p-2 border border-gray-300 outline-0 mt-2 rounded"
          placeholder="Search blogs..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        /> */}
      </header>

      {/* <Blog
        data={filteredBlogs}
        userId={userId}
        role={role}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      /> */}
      <div className="h-[88vh] mt-3 overflow-auto ">

        <Blog
          type="admin"
          userId={userId}
          role={role}
        />
      </div>
    </div>
  );
}

export default Blogs;
