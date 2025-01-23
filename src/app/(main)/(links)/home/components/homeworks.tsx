'use client';

import Scrollbars from "react-custom-scrollbars-2";
import {useEffect, useState} from "react";

interface IHomework {
    article_i: number;
    due_date: string;
    done: number;
    title: string;
    subject: {
        name: string;
        id: number;
    },
    class_: {
        name: string;
        id: number;
    }
}

export default function Homeworks() {
    const [homeworks, setHomeworks] = useState<IHomework[]>([]);
    const [page, setPage] = useState<number>(1);
    useEffect(() => {

    }, [])

    return (
        <Scrollbars
            className="w-full h-full"
            universal
            autoHide
        >
            {/*{notifications.map((notification, index) => (*/}
            {/*    <Link*/}
            {/*        key={index}*/}
            {/*        className="block w-full"*/}
            {/*        href={'/'}*/}
            {/*    >*/}
            {/*        <div className={cn(*/}
            {/*            "p-3 mb-2 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 w-full",*/}
            {/*            "bg-white"*/}
            {/*        )}>*/}
            {/*            {notification}*/}
            {/*        </div>*/}
            {/*    </Link>*/}
            {/*))}*/}
        </Scrollbars>
    );
}