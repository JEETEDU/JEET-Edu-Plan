'use client';

import React, {useEffect, useState} from "react";
import useFcmToken from "@/hooks/useFcmToken";
// import {getStoreData} from "@/app/(main)/components/functions";

export default function Body({children}: Readonly<{ children: React.ReactNode; }>) {
    function setScreenSizeProps() {
        const ih = window.innerHeight;
        const iw = window.innerWidth;
        document.documentElement.style.setProperty('--iw', `${iw}px`);
        document.documentElement.style.setProperty('--ih', `${ih}px`);
    }

    // const [uid, setUid] = useState<number>(0);

    useEffect(() => {
        setScreenSizeProps();
        window.addEventListener('resize', () => setScreenSizeProps());

        // (async () => {
        //     const res = (await getStoreData('/api/user/info', 'user-info')).response;
        //     if (res.success) {
        //         setUid(res.user.uid);
        //     }
        // })();
    }, []);

    useFcmToken();

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
    {children}
    </body>
}