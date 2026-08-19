"use client";
import dynamic from "next/dynamic";

const Blog = dynamic(
  () => import("@/components/ui/blog/Blog"),
  {
    loading: () => <div>Loading...</div>,
  }
); 
import { useAppSelector } from "@/lib/store/hooks";

function Blogs() {


  const userId = useAppSelector((state) => state.auth.user?._id);

  const role = useAppSelector((state) => state.auth.user?.role);


  return (
    <div className="min-h-screen">
      <header className="w-full border-b border-gray-200 dark:border-zinc-800 px-4 py-4">
        <div>
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Blogs Management
          </h2>

          <p className="text-gray-500 dark:text-gray-400">
            Manage platform blogs and content
          </p>
        </div>
      </header>

      <div className="h-[88vh] mt-3 overflow-auto">
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
