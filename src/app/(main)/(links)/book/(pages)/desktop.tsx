'use client';

import BookList from "@/app/(main)/(links)/book/components/bookList";
import {useState} from "react";
import BookReport from "@/app/(main)/(links)/book/[id]/mobile";

export default function Desktop() {
    const [head, setHead] = useState<number>(0);

    return (
        <div className="grid grid-cols-3 gap-4 pl-4 pb-4 pr-3 w-full h-full">
            <div className="col-span-2">
                <BookReport id={head}/>
            </div>
            <BookList setHeadAction={setHead} />
        </div>
    )
}