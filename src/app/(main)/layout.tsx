import type {Metadata} from "next";
import "./globals.css";
import React, {Suspense} from "react";
import {cookies} from "next/headers";
import Navigation from "@/app/(main)/components/desktop";
import {Navigation1, Navigation2} from "@/app/(main)/components/mobile";
import {CookiesProvider} from "next-client-cookies/server";
import Body from "@/app/(main)/_layout";
import openGraph from '../../../public/opengraph.png';

export const metadata: Metadata = {
    metadataBase: new URL("https://jeetplan.xyz"),
    title: "JEET Edu Plan",
    authors: [{name: "hegelty"}, {name: "hoyakim"}],
    creator: "@hegelty & @hoyakim",
    applicationName: "JEET Edu Plan",
    generator: "Next.js",
    icons: "/logo.png",
    openGraph: {
        title: "JEET Edu Plan",
        description: "JEET Edu Plan by 안성민",
        url: "https://jeetplan.xyz",
        siteName: "JEET Edu Plan",
        images: [
            {
                url: openGraph.src,
                width: openGraph.width,
                height: openGraph.height
            }
        ],
        locale: "ko_KR",
        alternateLocale: "en_US",
        type: "website",
    }
};

export default async function RootLayout(
    {children,}: Readonly<{ children: React.ReactNode; }>
) {
    const cookieStore = await cookies();
    const isMobile = cookieStore.get("isMobile") ?? {value: null};

    return (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <html lang="ko">
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

