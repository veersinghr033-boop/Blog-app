
import ReaderBlog from "@/components/ui/ReaderBlog/ReaderBlog";

export default function Page() {
  return (
    <div className="min-h-screen">
      <header className="mb-6 w-full border-b border-gray-200 dark:border-zinc-800  px-4 py-4">
        <h2 className="text-2xl text-black dark:text-white">Saved Blogs</h2>
        <p className="text-gray-500 dark:text-gray-400">
          View and manage your saved blogs
        </p>
      </header>

      <ReaderBlog type="saved" />
    </div>
  );
}