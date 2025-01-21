'use client';

import React, {useEffect} from "react";

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

    return <body style={{
        height: "var(--ih, 100vh)",
        width: "var(--iw, 100vw)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        touchAction: "none",
        position: "fixed",
    }}>
    {children}
    </body>
}