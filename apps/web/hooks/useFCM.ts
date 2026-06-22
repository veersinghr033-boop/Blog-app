import { useEffect } from "react";
import {
    getToken,
    onMessage,
} from "firebase/messaging";

import { messaging } from "@/lib/firebase";
import api from "@/utills/axios";

export const useFCM = ({
    userId,
}: {
    userId?: string;
}) => {
    useEffect(() => {
        if (!userId || !messaging) return;
        console.log("ok", messaging)
        const init = async () => {
            try {
                if ("serviceWorker" in navigator) {
                    await navigator.serviceWorker.register(
                        "/firebase-messaging-sw.js"
                    );
                    console.log("ok")
                }

                const permission =
                    await Notification.requestPermission();

                if (permission !== "granted") {
                    return;
                }

                const token = await getToken(
                    messaging!,
                    {
                        vapidKey:
                            process.env
                                .NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    }
                );

                console.log("FCM Token:", token);

                if (token) {
                    await api.post(
                        "/users/save-fcm-token",
                        {
                            token,
                        }
                    );
                    console.log("Not ok")
                }
            } catch (error) {
                console.log(error);
            }
        };

        init();

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground Message", payload);
        });

        return () => unsubscribe();
    }, [userId]);
};