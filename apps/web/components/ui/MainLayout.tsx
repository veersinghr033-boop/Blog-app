"use client";

import { Drawer } from "antd";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("./sidebar"));

const Navbar = dynamic(() => import("./navbar"));
import { useState } from "react";

function MainLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen ">
      <Navbar onMenuClick={() => setOpen(true)} />

      <div className="flex bg-stone-100">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <Drawer
          placement="left"
          open={open}
          onClose={() => setOpen(false)}
          // width={250}
          className="w-64!"
        >
          <Sidebar />
        </Drawer>

        <div
          className="
                    fixed left-0 top-16 h-[calc(100vh-64px)]
                    bg-stone-100
                        p-2
                        md:py-3
                        md:px-6
                        md:ml-[250px]
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
