// import {cookies} from "next/headers";
import Notice from "./mobile";
import {Suspense} from "react";

export default async function showPage({params}: { params: Promise<{ id: number }> }) {
    const {id} = await params;
    // const cookieStore = await cookies();
    // const isMobile = cookieStore.get("isMobile");

    return (
        <Suspense fallback={<h1>Loading...</h1>}>
            <div className="flex flex-col gap-4 h-full w-full items-center justify-center p-4 bg-white">
                <Notice id={id}/>
            </div>
        </Suspense>
    )
}