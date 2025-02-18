"use client";

import {useEffect, useRef, useState} from "react";
import {onMessage, Unsubscribe} from "firebase/messaging";
import {fetchToken, messaging, resetToken} from "@/firebase";
import {DELETE, GET, POST} from "@/app/(main)/components/functions";

async function getNotificationPermissionAndToken() {
    // Step 1: Check if Notifications are supported in the browser.
    if (!("Notification" in window)) {
        console.info("This browser does not support desktop notification");
        return null;
    }

    // Step 2: Check if permission is already granted.
    if (Notification.permission === "granted") {
        return await fetchToken();
    }

    // Step 3: If permission is not denied, request permission from the user.
    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            return await fetchToken();
        }
    }

    console.log("Notification permission not granted.");
    return null;
}

const useFcmToken = (uid: number) => {
    const [token, setToken] = useState<string | null>(null); // State to store the FCM token.
    // const retryLoadToken = useRef(0); // Ref to keep track of retry attempts.
    const isLoading = useRef(false); // Ref to keep track if a token fetch is currently in progress.

    const loadToken = async () => {
        if (isLoading.current) return null;

        isLoading.current = true; // Mark loading as in progress.

        const token: string | null = await getNotificationPermissionAndToken();

        // Step 5: Handle the case where permission is denied.
        if (Notification.permission === "denied") {
            console.info(
                "%cPush Notifications issue - permission denied",
                "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
            );
            isLoading.current = false;
            await DELETE('/api/user/fcm');
            return null;
        }

        isLoading.current = false;
        return token;
    };

    useEffect(() => {
        if ("Notification" in window) {
            loadToken().then((token) => {
                if (token) {
                    setToken(token);
                }
            });
        }
    }, []);

    useEffect(() => {
        const setupListener = async () => {
            if (!token) return; // Exit if no token is available.

            // console.log(`onMessage registered with token ${token}`);
            const m = await messaging();
            if (!m) return;

            return onMessage(m, (payload) => {
                if (Notification.permission !== "granted") return;

                console.log("Foreground push notification received:", payload);
                const link = payload.fcmOptions?.link || payload.data?.link;

                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(
                        payload.notification?.title || "New message",
                        {
                            body: payload.notification?.body || "This is a new message",
                            icon: "/logo.png",
                            data: link ? {url: link} : undefined,
                        }
                    );
                });
            })
        };

        let unsubscribe: Unsubscribe | null = null;

        setupListener().then((unsub) => {
            if (unsub) {
                unsubscribe = unsub;
            }
        });

        return () => unsubscribe?.();
    }, [token]);

    useEffect(() => {
        if ((uid > 0) && (token)) {
            (async () => {
                const res: { success: boolean; uid: { uid: number }[] } = await GET(`/api/user/fcm?token=${token}`);
                if (res.success) {
                    if (res.uid.length === 1) {
                        if (res.uid[0].uid !== uid) {
                            resetToken().then(async (_token) => {
                                if (_token) {
                                    await POST('/api/user/fcm', {
                                        fcm_token: _token,
                                    });
                                }
                            });
                        }
                    } else {
                        await POST('/api/user/fcm', {
                            fcm_token: token,
                        });
                    }
                } else {
                    await POST('/api/user/fcm', {
                        fcm_token: token,
                    });
                }
            })();
        }
    }, [uid, token]);
    // return {token, notificationPermissionStatus};
};

export default useFcmToken;