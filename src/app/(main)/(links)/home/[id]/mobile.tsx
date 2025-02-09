"use client";

import React, {useEffect, useState} from "react";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, initArticle, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import {Author, Category, Class_, Hr, Subject, Time, Title} from "@/app/(main)/(links)/home/(pages)/desktop";
import Link from "next/link";
import dynamic from "next/dynamic";
import {IClassInfo} from "@/app/(main)/(links)/mypage/(pages)/component/classSetting";
import {GET} from "@/app/(main)/components/functions";

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <Loading/>,
});

import 'react-quill/dist/quill.bubble.css'
import Loading from "@/app/(main)/loading";

// eslint-disable-next-line @next/next/no-async-client-component
export default function Notice({id}: { id: number }) {
    const [selectedNotice, setSelectedNotice] = useState<IArticle>(initArticle);
    const [selectedClass, setSelectedClass] = useState<IClassInfo>({
        display: 1,
        description: "",
        id: 0, name: "",
        students: [],
        subjects: [],
        teachers: []
    });

    useEffect(() => {
        (async () => {
            const resArticle = await loadArticleInfo(id);
            setSelectedNotice(resArticle.article);

            const resClass: { success: boolean; class_: IClassInfo } = await GET(`/api/class/${resArticle.article.class_id}`);
            if (resClass.success) setSelectedClass(resClass.class_);
        })();
    }, [id]);

    return (
        <div className="flex flex-col gap-4 h-full w-full justify-between p-4">
            <>
                <div className="flex flex-row gap-4 w-full justify-between items-start">
                    <div className="flex flex-row gap-2">
                        <Class_ class_={selectedClass.name || ""}/>
                        <Subject subject={selectedNotice.subject.name || ""}/>
                        <Category category={selectedNotice.category}/>
                    </div>
                    <Author name={selectedNotice.user.name}/>
                </div>
                <Title title={selectedNotice.title}/>
                <Hr/>
            </>
            <ReactQuill
                className="h-full max-h-full flex flex-col"
                value={selectedNotice.content}
                readOnly
                theme={'bubble'}
            />
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
                        className="p-2 rounded font-bold text-lg bg-blue-500 text-white md:hover:bg-blue-600"
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
