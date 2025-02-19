// importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
// importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");
// import {initializeApp} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
// import {getMessaging} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-sw.js";
importScripts("https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-compat.js");


// Replace these with your own Firebase config keys...
const firebaseConfig = {
    apiKey: "AIzaSyAjO7NI1N9471ExlInX4s0GoVS2NJDNvZg",
    authDomain: "fcm-demo-e5e67.firebaseapp.com",
    projectId: "fcm-demo-e5e67",
    storageBucket: "fcm-demo-e5e67.firebasestorage.app",
    messagingSenderId: "675208468942",
    appId: "1:675208468942:web:97d9cc20a12eff77a5f39f",
    measurementId: "G-4X0XRMLFS0"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// navigator.serviceWorker.register("firebase-messaging-sw.js").then((registration) => {
//     messaging.useServiceWorker(registration);
// });

messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload,
        payload.data || ""
    );

    // payload.fcmOptions?.link comes from our backend API route handle
    // payload.data.link comes from the Firebase Console where link is the 'key'
    // const link = payload.fcmOptions?.link || payload.data?.link;
    const link = "https://jeetplan.xyz";

    self.registration.showNotification(
        payload.data?.title || "New message",
        {
            body: payload.data?.message || "This is a new message",
            icon: "/logo.png",
            data: {url: link},
            image: "/opengraph.png",
        }
    );
});

self.addEventListener("notificationclick", function (event) {
    console.log("[firebase-messaging-sw.js] Notification click received.");
    console.log(event.notification)

    event.notification.close();

    // This checks if the client is already open and if it is, it focuses on the tab. If it is not open, it opens a new tab with the URL passed in the notification payload
    event.waitUntil(
        clients
            // https://developer.mozilla.org/en-US/docs/Web/API/Clients/matchAll
            .matchAll({type: "window", includeUncontrolled: true})
            .then(function (clientList) {
                const url = event.notification.data.url;

                if (!url) return;

                // If relative URL is passed in firebase console or API route handler, it may open a new window as the client.url is the full URL i.e. https://example.com/ and the url is /about whereas if we passed in the full URL, it will focus on the existing tab i.e. https://example.com/about
                for (const client of clientList) {
                    if (client.url === url && "focus" in client) {
                        return client.focus();
                    }
                }

                if (clients.openWindow) {
                    console.log("OPENWINDOW ON CLIENT");
                    return clients.openWindow(url);
                }
            })
    );
});