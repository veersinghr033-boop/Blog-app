"use client";

import FCMProvider from "@/components/FCMProvider";
import Messages from "@/components/ui/message/Message";

export default function Page() {
    return (
        <FCMProvider>
            <Messages />
        </FCMProvider>
    );
}