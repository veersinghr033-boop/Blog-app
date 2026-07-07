import Link from "next/link";
import { Button, Result } from 'antd';
export default function NotFoundPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center  px-6 text-center">
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={<Link
                    href="/"
                    className="mt-8 rounded-full bg-gray-500! px-5 py-3 font-medium text-slate-950! transition hover:bg-slate-200"
                >
                    Go home
                </Link>}
            />
            
        </main>
    );
}
import React from 'react';
// import { Button, Result } from 'antd';

// const App: React.FC = () => (
//     <Result
//         status="404"
//         title="404"
//         subTitle="Sorry, the page you visited does not exist."
//         extra={<Button type="primary">Back Home</Button>}
//     />
// );

// export default App;