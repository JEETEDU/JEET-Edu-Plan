import EditBoard from "./desktop";
import {Suspense} from "react";

export default async function showPage({params}: {params: Promise<{id: number}>}) {
    const {id} = await params

    return (
        <Suspense fallback={<h1>Loading...</h1>}>
            <div className="pb-4 h-full bg-gray-100">
                <EditBoard id={id}/>
            </div>
        </Suspense>
    )
}