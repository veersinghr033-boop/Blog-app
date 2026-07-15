import Link from "next/link";
import Result from "antd/es/result";
export default function NotFoundPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={
                    <Link
                        href="/"
                        className="mt-8 rounded-full bg-gray-500! px-5 py-3 font-medium text-slate-950! transition hover:bg-slate-200!"
                    >
                        Go home
                    </Link>
                }
            />
        </main>
    );
}
