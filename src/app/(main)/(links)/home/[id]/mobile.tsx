"use client";

import React, {useEffect, useState} from "react";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, initArticle, loadArticle, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import {Author, Category, Class_, Delete, Hr, Subject, Time, Title, Update} from "@/app/(main)/(links)/home/(pages)/desktop";
import Link from "next/link";
import dynamic from "next/dynamic";
import {DELETE} from "@/app/(main)/components/functions";

const ReactQuill = dynamic(() => import('react-quill-new'), {ssr: false})

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
        <div className="flex flex-col gap-4 h-full w-full justify-between p-4">
            <>
                <div className="flex flex-row gap-4 w-full justify-between items-center">
                    <Class_ class_={selectedNotice.class_?.name || ""}/>
                    <Subject subject={selectedNotice.subject.name || ""}/>
                    <Category category={selectedNotice.category}/>
                    <Title title={selectedNotice.title}/>
                    <Author name={selectedNotice.user.name}/>
                </div>
                <Hr/>
            </>
            <Scrollbars>
                <ReactQuill
                    className="text-gray-600 break-all grow"
                    value={selectedNotice.content}
                    readOnly
                    theme={'bubble'}
                />
            </Scrollbars>
            <>
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
                <Hr/>
                <div className="flex flex-row gap-4 w-full justify-between items-center">
                    <Link
                        className="p-1 rounded border-2 font-bold text-lg bg-blue-500 text-white border-blue-500"
                        href={`/board/${selectedNotice.id}`}
                    >
                        게시물 바로가기
                    </Link>
                    <Time create_time={selectedNotice.create_time} update_time={selectedNotice.update_time}/>
                </div>
            </>
        </div>
    );
}
