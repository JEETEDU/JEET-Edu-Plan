import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {cookies} from "next/headers";
import Navigation from "@/app/components/desktop";
import {Navigation1, Navigation2} from "@/app/components/mobile";
import {CookiesProvider} from "next-client-cookies/server";

export const metadata: Metadata = {
    title: "JEET",
    description: "hegelty & hoyakim",
};

export default async function RootLayout(
    {children,}: Readonly<{ children: React.ReactNode; }>
) {
    const cookieStore = await cookies();
    const isMobile = cookieStore.get("isMobile") ?? { value: null };

    return (
        <CookiesProvider>
            <html lang="en">
            <body className="flex flex-col h-screen min-h-screen max-h-screen">
            <div className="static">
                {isMobile?.value === 'true' ? <Navigation1/> : <Navigation/>}
            </div>
            <main className="flex-grow-1 overflow-hidden">
                {children}
            </main>
            <div className="static">
                {isMobile?.value === 'true' ? <Navigation2/> : null}
            </div>
            </body>
            </html>
        </CookiesProvider>
    );
}