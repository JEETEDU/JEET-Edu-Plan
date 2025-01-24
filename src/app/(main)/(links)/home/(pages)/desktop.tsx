"use client";

import React, {useEffect, useRef, useState} from "react";
import {cn, DELETE, GET} from "@/app/(main)/components/functions";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, loadArticle} from "@/app/(main)/(links)/board/component";
import {ArticleItem} from "@/app/(main)/(links)/board/(pages)/desktop";
import Notice from "@/app/(main)/(links)/home/[id]/mobile";
import Homeworks from "@/app/(main)/(links)/home/components/homeworks";

export function Category({category}: { category: number }) {
    const text = [
        "일반",
        "숙제",
        "질문",
        "자료"
    ]
    const color = [
        "bg-green-500 text-white border-green-500",
        "bg-red-500 text-white border-red-500",
        "bg-blue-500 text-white border-blue-500",
        "bg-black text-white border-black",
    ]
    return (
        <div className={cn("p-1 rounded border-2 font-bold", color[category])}>
            {text[category]}
        </div>
    );
}

export function Subject({subject}: { subject: string | null }) {
    if (subject) return (
        <div className="flex flex-col border-2 border-green p-1 rounded justify-center items-end text-black">
            {subject}
        </div>
    );
}

export function Class_({class_}: { class_: string | null }) {
    if (class_) return (
        <div className="flex flex-col border-2 border-blue p-1 rounded justify-center items-end text-black bg-blue">
            {class_}
        </div>
    );
}

export function Delete({id}: { id: number }) {
    return (
        <button
            className="p-1 rounded border-2 font-bold text-lg bg-red-500 text-white border-red-500"
            onClick={async () => {
                await DELETE("/api/board", {
                    article_id: id,
                }).then(loadArticle);
            }}
        >
            삭제
        </button>
    );
}

export function Update({id}: { id: number }) {
    return (
        <button
            className="p-1 rounded border-2 font-bold text-lg bg-blue-500 text-white border-blue-500"
            onClick={() => {
                alert("아직 구현 안함")
            }}
        >
            수정
        </button>
    );
}

export function Title({title}: { title: string }) {
    return (
        <div className="flex-1 text-2xl">
            {title}
        </div>
    );
}

export function Time({create_time, update_time}: { create_time: string, update_time: string }) {
    return (
        <div className="flex flex-col text-sm justify-center items-end flex-1 text-gray-600">
            <div>
                작성 시간: {(new Date(create_time)).toLocaleString()}
            </div>
            {(create_time !== update_time) && (
                <div>
                    마지막 업데이트: {new Date(update_time).toLocaleString()}
                </div>
            )}
        </div>
    );
}

export function Hr() {
    return (
        <div className="w-full">
            <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 w-full"/>
        </div>
    );
}

export function Author({name}: { name: string }) {
    return (
        <div className="text-black font-bold">
            {name} 선생님
        </div>
    )
}

interface IResponseNotices {
    success: boolean;
    notices: IArticle[];
}

export default function Desktop() {
    const [tab, setTab] = useState<number>(0);
    const [notices, setNotices] = useState<IArticle[]>([]);
    const [head, setHead] = useState<number>(0);

    useEffect(() => {
        if (tab === 0) {
            (async () => {
                const res: IResponseNotices = await GET('/api/user/notice');
                if (res.success) {
                    setNotices(res.notices);
                    if (res.notices.length > 0) {
                        setHead(res.notices[0].id);
                    }
                }
            })();
        }
    }, [tab])


    return (
        <>
            <div className="h-full flex flex-col">
                {(tab === 0) && (
                    <div className="flex-1 grid grid-cols-3 overflow-hidden bg-gray-100"> {/* hear */}
                        <div className="col-span-2 bg-white mt-2 mx-4 rounded-lg border">
                            {(head !== 0) && (
                                <Notice id={head}/>
                            )}
                            <div className="flex flex-col gap-4 h-full w-full items-center justify-between p-4">
                                {(head === 0) && (
                                    <div className="text-center text-4xl flex-1 items-center flex">
                                        공지가 선택되지 않았습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                        <Scrollbars
                            className="w-full h-full" // bg-gray-100
                            universal
                            autoHide
                        >
                            <div className="p-2 space-y-2 flex flex-col h-full">
                                {notices.map((notice: IArticle) => (
                                    <ArticleItem
                                        article={notice}
                                        key={notice.id}
                                        head={head}
                                        setHead={setHead}
                                    />
                                ))}
                            </div>
                        </Scrollbars>
                    </div>
                )}
                {(tab === 1) && (
                    <div className="flex-1 grid grid-cols-3 overflow-hidden bg-gray-100 px-4 gap-4 py-1">
                        <div className="col-span-2 bg-white rounded-lg border">
                            {(head !== 0) && (
                                <Notice id={head}/>
                            )}
                        </div>
                        <Homeworks setHeadAction={setHead}/>
                    </div>
                )}
                {(tab === 2) && (
                    <div className="flex-1 grid grid-cols-2 overflow-hidden">
                        <div className="overflow-hidden pt-4 px-4 bg-gray-100 flex flex-col">
                            <div className="text-center text-2xl mb-4">
                                내 할일 목록
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-gray-100 p-4 grid grid-cols-3 w-full items-center">
                    <div></div>

                    <div className="flex justify-center">
                        <div className="p-0 rounded-2xl shadow-2xl pointer-events-auto grid grid-cols-3 component-form">
                            <button
                                className={cn(
                                    {
                                        "bg-white pointer-events-none": (tab === 0),
                                        "bg-gray-300 hover:bg-gray-200 transition duration-200": (tab !== 0),
                                    },
                                    "h-fit rounded-l-lg text-center p-2"
                                )}
                                onClick={() => setTab(0)}
                            >
                                공지사항
                            </button>
                            <button
                                className={cn(
                                    {
                                        "bg-white pointer-events-none": (tab === 1),
                                        "bg-gray-300 hover:bg-gray-200 transition duration-200": (tab !== 1),
                                    },
                                    "h-fit text-center p-2"
                                )}
                                onClick={() => setTab(1)}
                            >
                                숙제
                            </button>
                            <button
                                className={cn(
                                    {
                                        "bg-white pointer-events-none": (tab === 2),
                                        "bg-gray-300 hover:bg-gray-200 transition duration-200": (tab !== 2),
                                    },
                                    "h-fit rounded-r-lg text-center p-2"
                                )}
                                onClick={() => setTab(2)}
                            >
                                할 일 목록
                            </button>
                        </div>
                    </div>

                    {!tab && (
                        <div className="flex justify-end">
                            <button
                                className="bg-white hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5"
                                // onClick={}
                            >
                                내 할일 추가하기
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}