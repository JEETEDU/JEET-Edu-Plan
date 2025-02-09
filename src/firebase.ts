import {getApp, getApps, initializeApp} from "firebase/app";
import {getMessaging, getToken, isSupported} from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAjO7NI1N9471ExlInX4s0GoVS2NJDNvZg",
    authDomain: "fcm-demo-e5e67.firebaseapp.com",
    projectId: "fcm-demo-e5e67",
    storageBucket: "fcm-demo-e5e67.firebasestorage.app",
    messagingSenderId: "675208468942",
    appId: "1:675208468942:web:97d9cc20a12eff77a5f39f",
    measurementId: "G-4X0XRMLFS0"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
    try {
        const fcmMessaging = await messaging();
        if (fcmMessaging) {
            return await getToken(fcmMessaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
            });
        }
        return null;
    } catch (err) {
        console.error("An error occurred while fetching the token:", err);
        return null;
    }
};

export {app, messaging};