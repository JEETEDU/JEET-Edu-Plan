import type {Metadata} from "next";
import "./globals.css";
import React, {Suspense} from "react";
import {cookies} from "next/headers";
import Navigation from "@/app/(main)/components/desktop";
import {Navigation1, Navigation2} from "@/app/(main)/components/mobile";
import {CookiesProvider} from "next-client-cookies/server";
import Body from "@/app/(main)/_layout";

export const metadata: Metadata = {
    title: "JEET",
    description: "hegelty & hoyakim",
};

export default async function RootLayout(
    {children,}: Readonly<{ children: React.ReactNode; }>
) {
    const cookieStore = await cookies();
    const isMobile = cookieStore.get("isMobile") ?? {value: null};

    return (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <html lang="en">
            <Body>
                <div>
                    {isMobile?.value === 'true' ? <Navigation1/> : <Navigation/>}
                </div>
                <main className="flex-grow-1 overflow-hidden">
                    <Suspense fallback={
                        <div className="text-3xl font-bold w-full h-full flex justify-center items-center">
                            로딩중...
                        </div>
                    }>
                        <CookiesProvider>{children}</CookiesProvider>
                    </Suspense>
                </main>
                <div>
                    {isMobile?.value === 'true' ? <Navigation2/> : null}
                </div>
            </Body>
            </html>
        </>
    );
}

