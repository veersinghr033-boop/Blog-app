"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { signup } from "@/lib/store/features/authThunk";
import { toast } from "sonner";
import ThemeToggle from "@/components/ui/Theme"; 

interface FormData {
    username: string;
    email: string;
    password: string;
    role: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: FormData = {
            username: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        };

        try {
            const resultAction: any = await dispatch(signup(data) as any);

            if (signup.fulfilled.match(resultAction)) {
                toast.success("Signup successful");

                const roles = resultAction.payload.user?.roles || [
                    resultAction.payload.user?.role,
                ];

                if (roles.includes("admin")) {
                    router.push("/admin");
                } else {
                    router.push("/user");
                }
            } else {
                toast.error(resultAction.payload || "Signup failed");
            }
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-950 px-4 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6 text-black dark:text-white">
                    Register
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-2 font-medium text-black dark:text-white">
                            Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-black dark:text-white">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-black dark:text-white">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center mt-5 text-gray-600 dark:text-gray-400">
                    Already have an account?
                    <span
                        onClick={() => router.push("/login")}
                        className="text-black dark:text-white font-semibold cursor-pointer ml-1"
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}