import ReaderBlog from "@/components/ui/ReaderBlog/ReaderBlog";

export default function Page() {
    return (
        <div className="min-h-screen">
            <header className="mb-6 w-full border-b border-gray-200 px-4 py-4">
                <h2 className="text-2xl font-semibold">Trending Blogs</h2>
                <p className="text-gray-500">
                    View and manage your trending blogs
                </p>
            </header>

            <ReaderBlog type="trending" />
        </div>
    );
}