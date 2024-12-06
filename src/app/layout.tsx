import type {Metadata} from "next";
import "./globals.css";
import React from "react";
import {cookies} from "next/headers";
import Navigation from "@/app/components/desktop/Navigation";
import {Navigation1, Navigation2} from "@/app/components/mobile/Navigation";
import {CookiesProvider} from "next-client-cookies/server";

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
        <CookiesProvider>
            <html lang="en">
            <body className="flex flex-col">
            <div className="flex-none w-fit">
                {isMobile.value === 'true' ? <Navigation1/> : <Navigation/>}
            </div>
            <main className="grow overflow-auto">
                {children}
            </main>
            <div className="flex-none w-fit">
                {isMobile.value === 'true' ? <Navigation2/> : null}
            </div>
            </body>
            </html>
        </CookiesProvider>
    );
}