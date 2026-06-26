import { useEffect, useRef } from "react";
import api from "@/utills/axios";

export const useFCM = ({ userId }: { userId?: string }) => {
    const initializedUserRef = useRef<string | null>(null);

    useEffect(() => {
        if (!userId) {
            initializedUserRef.current = null;
            return;
        }

        if (initializedUserRef.current === userId) {
            return;
        }

        initializedUserRef.current = userId;

        let isActive = true;

        const init = async () => {
            try {
                const { getToken, onMessage } = await import("firebase/messaging");
                const { messaging } = await import("@/lib/firebase");

                if (!messaging || typeof window === "undefined") {
                    return;
                }

                if ("serviceWorker" in navigator) {
                    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
                }

                const permission = await Notification.requestPermission();

                if (permission !== "granted" || !isActive) {
                    return;
                }

                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                });

                if (token && isActive) {
                    await api.post("/users/save-fcm-token", { token });
                }

                if (!isActive) {
                    return;
                }

                const unsubscribe = onMessage(messaging, (payload) => {
                    console.log("Foreground Message", payload);
                });

                return unsubscribe;
            } catch (error) {
                console.log(error);
            }
        };

        let unsubscribePromise: Promise<(() => void) | undefined>;
        unsubscribePromise = init();

        return () => {
            isActive = false;
            unsubscribePromise.then((unsubscribe) => unsubscribe?.());
        };
    }, [userId]);
};