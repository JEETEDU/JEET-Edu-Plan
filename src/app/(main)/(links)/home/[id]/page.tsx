// import {cookies} from "next/headers";
import Notice from "./mobile";
import {Suspense} from "react";

export default async function showPage({params}: { params: Promise<{ id: number }> }) {
    const {id} = await params;
    // const cookieStore = await cookies();
    // const isMobile = cookieStore.get("isMobile");

    return (
        <Suspense fallback={<h1>Loading...</h1>}>
            <Notice id={id}/>
        </Suspense>
    )
}