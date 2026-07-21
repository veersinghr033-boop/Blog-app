"use client";

import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { store } from "@/lib/store/store";
import { Toaster } from "sonner";
import AntdThemeProvider from "./ui/AntdThemeProvider";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AntdThemeProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AntdThemeProvider>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
}