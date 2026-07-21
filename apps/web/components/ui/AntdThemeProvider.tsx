"use client";

import { ConfigProvider, theme } from "antd";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AntdThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <>{children}</>;

    return (
        <ConfigProvider
            theme={{
                algorithm:
                    resolvedTheme === "dark"
                        ? theme.darkAlgorithm
                        : theme.defaultAlgorithm,
            }}
        >
            {children}
        </ConfigProvider>
    );
}