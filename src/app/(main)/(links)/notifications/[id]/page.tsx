import {cookies} from "next/headers";
import Desktop from "./desktop";
import Mobile from "./mobile";
import {Suspense} from "react";

export default async function showPage({params}) {
    const {id} = await params
    const cookieStore = await cookies();
    const isMobile = cookieStore.get("isMobile");

    return (
        <Suspense failback={<h1>Loading...</h1>}>
            {isMobile.value === 'true' ? <Mobile id={id}/> : <Desktop id={id}/>}
        </Suspense>
    )
}