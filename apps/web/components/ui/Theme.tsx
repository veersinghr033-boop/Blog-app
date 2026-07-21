"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 dark:border-zinc-500 bg-white dark:bg-zinc-900"
            >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-32 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg z-50">
                    <button
                        onClick={() => {
                            setTheme("light");
                            setOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        Light
                    </button>

                    <button
                        onClick={() => {
                            setTheme("dark");
                            setOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        Dark
                    </button>

                    <button
                        onClick={() => {
                            setTheme("system");
                            setOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        System
                    </button>
                </div>
            )}
        </div>
    );
}