
import ReaderBlog from "@/components/ui/ReaderBlog/ReaderBlog";

export default function Page() {
  return (
    <div className="min-h-screen">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">Saved Blogs</h2>
        <p className="text-gray-500">
          View and manage your saved blogs
        </p>
      </header>

      <ReaderBlog type="saved" />
    </div>
  );
}