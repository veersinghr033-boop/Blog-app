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
                    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
                    console.log("FCM: service worker registered", reg.scope);
                }

                const permission = await Notification.requestPermission();
                console.log("FCM: notification permission", permission);

                if (permission !== "granted" || !isActive) {
                    return;
                }

                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                });

                console.log("FCM: getToken returned", token);

                if (token && isActive) {
                    try {
                        const res = await api.post("/users/save-fcm-token", { token });
                        console.log('FCM: token saved', res?.data);
                    } catch (err) {
                        console.error('FCM: failed to save token', err);
                    }
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