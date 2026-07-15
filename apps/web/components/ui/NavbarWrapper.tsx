"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "./navbar";

const Sidebar = dynamic(
    () => import("./sidebar"),
    {
        ssr: false,
    }
);

export default function NavbarWrapper() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Navbar onMenuClick={() => setOpen(true)} />

            {open && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute left-0 top-16 h-full w-64 bg-white p-4 pt-10">
                        <button
                            className="absolute right-3 top-3 text-gray-600"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </button>

                        <Sidebar
                            mobile
                            open
                            onClose={() => setOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}