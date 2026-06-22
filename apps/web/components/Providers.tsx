"use client";

import { Spin } from "antd";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { store, persistor } from "@/lib/store/store";
import { useFCM } from "@/hooks/useFCM";
import { useAppSelector } from "@/lib/store/hooks";
const queryClient = new QueryClient();

function FCMProvider({ children }: {
  children: React.ReactNode;
}) {

  const userId = useAppSelector((state) => state.auth.user?.id);

  useFCM({ userId });

  return children;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate
          loading={<Spin size="large" />}
          persistor={persistor}
        >
          <FCMProvider>
            {children}
          </FCMProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}