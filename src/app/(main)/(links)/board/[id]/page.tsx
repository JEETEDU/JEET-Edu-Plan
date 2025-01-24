import {cookies} from "next/headers";
import Chatting from "./mobile";
import {Suspense} from "react";
import {cn} from "@/app/(main)/components/functions";

export default async function showPage({params}: { params: Promise<{ id: number }> }) {
    const {id} = await params
    const cookieStore = await cookies();
    const isMobile = cookieStore.get("isMobile");

    return (
        <Suspense fallback={
            <div className="text-3xl font-bold w-full h-full flex justify-center items-center">
                로딩중...
            </div>
        }>
            <div className={cn(
                "w-full h-full bg-gray-100",
                isMobile ? "p-2" : "p-4"
            )}>
                <Chatting id={id}/>
            </div>
        </Suspense>
    )
}