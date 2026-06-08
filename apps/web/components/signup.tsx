"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { signup } from "@/lib/store/features/authThunk";
import { message } from "antd";
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
        role: "reader"
    });


    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const data: FormData= {
            username: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        }
        try {
            const resultAction: any = await dispatch(signup(data)as any);
            if (signup.fulfilled.match(resultAction)) {
                message.success("Signup successful");
                if (resultAction.payload.user.role === "admin") {
                    router.push("/admin");
                } if (resultAction.payload.user.role === "author") {
                    router.push("/author");
                } else {
                    router.push("/reader");
                }
                router.push("/login");
            } else {
                message.error(resultAction.payload || "Signup failed");
            }
        } catch (error: any) {
            message.error(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

                <h1 className="text-3xl font-bold text-center mb-6">
                    Register
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>
                        <label className="block mb-2 font-medium">
                            Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

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
                        Register
                    </button>

                </form>

                <p className="text-center mt-5 text-gray-600">
                    Already have an account?

                    <span
                        onClick={() => router.push("/login")}
                        className="text-black font-semibold cursor-pointer ml-1"
                    >
                        Login
                    </span>
                </p>

            </div>
        </div>
    );
}