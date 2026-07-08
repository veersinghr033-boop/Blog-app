import Link from "next/link";
import {  Result } from 'antd';

export default function UnauthorizedPage() {
    return (
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={<div className="mt-8 flex justify-center gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-full bg-slate-900! px-6 py-3 text-sm font-semibold text-white! transition hover:bg-slate-700!"
                    >
                        Go to homepage
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-gray-300! px-6 py-3 text-sm font-semibold text-slate-900! transition hover:bg-gray-100!"
                    >
                        Sign in
                    </Link>
                </div>}
            />
                
            
    );
}
