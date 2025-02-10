'use client';

import React, {useEffect} from "react";
import useFcmToken from "@/hooks/useFcmToken";

export default function Body({children}: Readonly<{ children: React.ReactNode; }>) {
    function setScreenSizeProps() {
        const ih = window.innerHeight;
        const iw = window.innerWidth;
        document.documentElement.style.setProperty('--iw', `${iw}px`);
        document.documentElement.style.setProperty('--ih', `${ih}px`);
    }

    useEffect(() => {
        setScreenSizeProps();
        window.addEventListener('resize', () => setScreenSizeProps());
    }, []);
    const {token, notificationPermissionStatus} = useFcmToken();

    return <body style={{
        height: "var(--ih, 100vh)",
        width: "var(--iw, 100vw)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        touchAction: "none",
        position: "fixed",
        backgroundColor: "rgb(243 244 246 / 1)"
    }}>
    <div>
        {token}
    </div>
    {children}
    </body>
}