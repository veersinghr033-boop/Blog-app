"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { login } from "@/lib/store/features/authThunk";
import { message } from "antd";

interface FormData {
    email: string;
    password: string;
}

export default function LoginPage() {

    const router = useRouter();
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: ""
    });


    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const resultAction: any = await dispatch(login(formData));
            if (login.fulfilled.match(resultAction)) {
                message.success("Login successful");
                if (resultAction.payload.user.role === "admin") {
                    router.push("/admin");
                } if (resultAction.payload.user.role === "author") {
                    router.push("/author");
                } else {
                    router.push("/reader");
                }
                router.push("/");
            } else {
                message.error(resultAction.payload || "Login failed");
            }
        } catch (error: any) {
            message.error(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

                <h1 className="text-3xl font-bold text-center mb-6">
                    Login
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>
                        <label className="block mb-2 font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
                    >
                        Login
                    </button>

                </form>

                <p className="text-center mt-5 text-gray-600">
                    Don't have an account?

                    <span
                        onClick={() => router.push("/signup")}
                        className="text-black font-semibold cursor-pointer ml-1"
                    >
                        Register
                    </span>
                </p>

            </div>
        </div>
    );
}