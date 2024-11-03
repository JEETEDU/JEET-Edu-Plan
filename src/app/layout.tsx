import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {cookies} from "next/headers";
import Navigation from "@/app/components/desktop/Navigation";
import {Navigation1, Navigation2} from "@/app/components/mobile/Navigation";

export const metadata: Metadata = {
    title: "JEET",
    description: "hegelty & hoyakim",
};

export default async function RootLayout(
    {children,}: Readonly<{ children: React.ReactNode; }>
) {
    const cookieStore = await cookies();
    const isMobile = cookieStore.get("isMobile");

    return (
        <html lang="en">
        <body>
        {isMobile.value === 'true' ? <Navigation1/> : <Navigation/>}
        {/*<Navigation/>*/}
        {children}
        {isMobile.value === 'true' ? <Navigation2/> : ""}
        </body>
        </html>
    );
}