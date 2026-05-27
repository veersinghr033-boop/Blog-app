"use client";

import { Spin } from "antd";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { store, persistor } from "@/lib/store/store";

const queryClient = new QueryClient();

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
          {children}
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}