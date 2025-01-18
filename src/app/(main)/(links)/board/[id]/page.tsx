// import {cookies} from "next/headers";
import Chatting from "./mobile";
import {Suspense} from "react";

export default async function showPage({params}) {
    const {id} = await params
    // const cookieStore = await cookies();
    // const isMobile = cookieStore.get("isMobile");

    return (
        <Suspense failback={<h1>Loading...</h1>}>
            <div className="pb-4 h-full bg-gray-100">
                <Chatting id={id}/>
            </div>
        </Suspense>
    )
}