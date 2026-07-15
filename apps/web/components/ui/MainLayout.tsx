import Sidebar from "./sidebar";
import NavbarWrapper from "./NavbarWrapper";

function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <NavbarWrapper />

      <div className="flex bg-stone-100">
        <div className="hidden md:block">
          <Sidebar />
        </div>

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