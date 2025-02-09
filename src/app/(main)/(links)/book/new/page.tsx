import {Suspense} from "react";
import BookReport from "@/app/(main)/(links)/book/[id]/mobile";

export default async function Page() {
    return (
        <Suspense fallback={
            <div className="text-3xl font-bold w-full h-full flex justify-center items-center">
                로딩중...
            </div>
        }>
            <div className="px-2 pb-2 w-full h-full">
                <BookReport id={0}/>
            </div>
        </Suspense>
    )
}