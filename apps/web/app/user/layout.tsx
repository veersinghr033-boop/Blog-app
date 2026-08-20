"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/ui/MainLayout";
import { useAppSelector } from "@/lib/store/hooks";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const { token, user } = useAppSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (!token) {
            router.replace("/login");
            return;
        }

        if (!user?.roles?.includes("user")) {
            router.replace("/unauthorized");
            return;
        }
    }, [token, user, router]);

    if (!token) {
        return <div>Loading...</div>;
    }

    return <MainLayout>{children}</MainLayout>;
}