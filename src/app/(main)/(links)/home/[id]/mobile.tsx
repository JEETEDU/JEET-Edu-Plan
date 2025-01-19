"use client";

import React, {useEffect, useState} from "react";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, initArticle, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import {Author, Category, Class_, Delete, Hr, Subject, Time, Title, Update} from "@/app/(main)/(links)/home/(pages)/desktop";
import Link from "next/link";

// eslint-disable-next-line @next/next/no-async-client-component
export default function Notice({id}: { id: number }) {
    const [selectedNotice, setSelectedNotice] = useState<IArticle>(initArticle);

    useEffect(() => {
        (async () => {
            const res = await loadArticleInfo(id);
            setSelectedNotice(res.article);
        })();
    }, [id]);

    return (
        <>
            <div className="flex flex-row gap-4 w-full justify-between items-center">
                <Class_ class_={selectedNotice.class_?.name || ""}/>
                <Subject subject={selectedNotice.subject.name || ""}/>
                <Category category={selectedNotice.category}/>
                <Title title={selectedNotice.title}/>
                <Author name={selectedNotice.user.name}/>
            </div>
            <Hr/>
            <Scrollbars
                className="w-full h-fit"
                universal
                autoHide
                autoHeight
            >
                <div className="flex flex-row gap-2 text-sm mb-2 items-center">
                    {selectedNotice.attach_files!.map((file, index) => (
                        <Link
                            key={index}
                            className="flex items-center border rounded whitespace-nowrap p-1"
                            href={file.path}
                        >
                            {file.name}
                        </Link>
                    ))}
                </div>
            </Scrollbars>
            <div className="text-center text-2xl flex-1 items-center flex w-full justify-center rounded">
                {selectedNotice.content}
            </div>
            <Hr/>
            <div className="flex flex-row gap-4 w-full justify-between items-center">
                <Update id={selectedNotice.id}/>
                <Delete id={selectedNotice.id}/>
                <Time create_time={selectedNotice.create_time} update_time={selectedNotice.update_time}/>
            </div>
        </>
    );
}
