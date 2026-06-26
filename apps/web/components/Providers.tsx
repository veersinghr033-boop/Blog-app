"use client";

import { Spin } from "antd";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { store, persistor } from "@/lib/store/store";
import { useFCM } from "@/hooks/useFCM";
import { useAppSelector } from "@/lib/store/hooks";

function FCMProvider({ children }: { children: React.ReactNode }) {
  const userId = useAppSelector((state) => state.auth.user?.id);

  useFCM({ userId });

  return children;
}

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

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={<Spin size="large" />} persistor={persistor}>
          <FCMProvider>{children}</FCMProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}