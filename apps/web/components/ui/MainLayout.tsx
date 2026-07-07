"use client";

import { useState } from "react";

import Sidebar from "./sidebar";
import Navbar from "./navbar";

function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen ">
      <Navbar onMenuClick={() => setOpen(true)} />

      <div className="flex bg-stone-100">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white p-4">
              <button
                className="mb-4 text-gray-600"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
              <Sidebar mobile open onClose={() => setOpen(false)} />
            </div>
          </div>
        )}

        <div
          className="
                    fixed left-0 top-16 h-[calc(100vh-64px)]
                    bg-stone-100
                        p-2
                        md:py-3
                        md:px-6
                        md:ml-62.5
                        md:w-[calc(100%-250px)]
                        w-full
                    "
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
