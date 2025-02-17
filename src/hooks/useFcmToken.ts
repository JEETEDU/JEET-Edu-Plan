"use client";

import {useEffect, useRef, useState} from "react";
import {onMessage, Unsubscribe} from "firebase/messaging";
import {fetchToken, messaging, resetToken} from "@/firebase";
import {useRouter} from "next/navigation";
import {DELETE, GET, getStoreData, POST} from "@/app/(main)/components/functions";

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

const useFcmToken = () => {
    const router = useRouter(); // Initialize the router for navigation.
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null); // State to store the notification permission status.
    const [token, setToken] = useState<string | null>(null); // State to store the FCM token.
    // const retryLoadToken = useRef(0); // Ref to keep track of retry attempts.
    const isLoading = useRef(false); // Ref to keep track if a token fetch is currently in progress.

    const loadToken = async () => {
        if (isLoading.current) return;

        isLoading.current = true; // Mark loading as in progress.

        // navigator.serviceWorker.register("firebase-messaging-sw.js").then();

        let token: string | null = null
        await resetToken().then(async () => {
            token = await getNotificationPermissionAndToken();
        })


        // Step 5: Handle the case where permission is denied.
        if (Notification.permission === "denied") {
            setNotificationPermissionStatus("denied");
            console.info(
                "%cPush Notifications issue - permission denied",
                "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
            );
            isLoading.current = false;
            await DELETE('/api/user/fcm');
            return;
        }

        // if (!token) {
        //     if (retryLoadToken.current >= 3) {
        //         alert("Unable to load token, refresh the browser");
        //         console.info(
        //             "%cPush Notifications issue - unable to load token after 3 retries",
        //             "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
        //         );
        //         isLoading.current = false;
        //         return;
        //     }
        //
        //     retryLoadToken.current += 1;
        //     console.error("An error occurred while retrieving token. Retrying...");
        //     isLoading.current = false;
        //     await loadToken();
        //     return;
        // }

        setNotificationPermissionStatus(Notification.permission);
        setToken(token);
        isLoading.current = false;
    };

    useEffect(() => {
        if ("Notification" in window) {
            loadToken().then();
        }
    }, []);

    useEffect(() => {
        const setupListener = async () => {
            if (!token) return; // Exit if no token is available.

            console.log(`onMessage registered with token ${token}`);
            const m = await messaging();
            if (!m) return;

            return onMessage(m, (payload) => {
                if (Notification.permission !== "granted") return;

                console.log("Foreground push notification received:", payload);
                const link = payload.fcmOptions?.link || payload.data?.link;

                // if (link) {
                //     toast.info(
                //         `${payload.notification?.title}: ${payload.notification?.body}`,
                //         {
                //             action: {
                //                 label: "Visit",
                //                 onClick: () => {
                //                     const link = payload.fcmOptions?.link || payload.data?.link;
                //                     if (link) {
                //                         router.push(link);
                //                     }
                //                 },
                //             },
                //         }
                //     );
                // } else {
                //     toast.info(
                //         `${payload.notification?.title}: ${payload.notification?.body}`
                //     );
                // }

                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(
                        payload.notification?.title || "New message",
                        {
                            body: payload.notification?.body || "This is a new message",
                            data: link ? {url: link} : undefined,
                        }
                    );

                    // Step 10: Handle notification click event to navigate to a link if present.
                    // n.onclick = (event) => {
                    //     event.preventDefault();
                    //     const link = (event.target as any)?.data?.url;
                    //     if (link) {
                    //         router.push(link);
                    //     } else {
                    //         console.log("No link found in the notification payload");
                    //     }
                    // };
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
    }, [token, router]);

    useEffect(() => {
        if (token) {
            (async () => {
                await POST('/api/user/fcm', {
                    fcm_token: token,
                });
                const res = getStoreData(`/api/user/fcm?token=${token}`, 'fcmUid');
                // await GET(`/api/user/fcm?token=${token}`);
                console.log("res", res);
            })();
        }
    }, [token]);

    // useEffect(() => {
    //     resetToken().then();
    // }, [uid])

    return {token, notificationPermissionStatus};
};

export default useFcmToken;