"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { useFCM } from "@/hooks/useFCM";

export default function FCMProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const userId = useAppSelector(
        (state) => state.auth.user?.id
    );

    useFCM({ userId });

    return <>{children}</>;
}