"use client";

import React, {useEffect, useState} from "react";
import {cn, GET} from "@/app/(main)/components/functions";
import Link from "next/link";
import {IArticle, initArticle, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import Scrollbars from "react-custom-scrollbars-2";
import {Author, Category, Class_, Delete, Hr, Subject, Time, Title, Update} from "@/app/(main)/(links)/home/(pages)/desktop";
import Homeworks from "@/app/(main)/(links)/home/components/homeworks";

// 더 할 작업
// 1. 공지사항은 종류에 따라 색으로 구분, 기한 표시 등등
// 3. 디자인 좀 수정해야됨...(그림자 빼기 등)
// 3.1. 지금도 나쁘지 않을지도..?

export default function Mobile() {
    const [tab, setTab] = useState<number>(0);

    const [notices, setNotices] = useState<IArticle[]>([]);

    useEffect(() => {
        interface IResponseNotices {
            success: boolean;
            notices: IArticle[];
        }

        (async () => {
            const resClass: IResponseNotices = await GET('/api/user/notice');
            if (resClass.success) {
                setNotices(resClass.notices);
            }
        })();
    }, [])

    return (
        <div className="flex flex-col h-full">
            <div className="h-fit">
                <div className="static h-fit grid grid-cols-3 w-screen">
                    <button
                        className={cn({
                            "bg-white pointer-events-none": (tab === 0),
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": (tab !== 0),
                        }, "h-fit text-center p-2")}
                        onClick={() => setTab(0)}
                    >
                        공지사항
                    </button>
                    <button
                        className={cn({
                            "bg-white pointer-events-none": (tab === 1),
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": (tab !== 1),
                        }, "h-fit text-center p-2")}
                        onClick={() => setTab(1)}
                    >
                        숙제
                    </button>
                    <button
                        className={cn({
                            "bg-white pointer-events-none": (tab === 2),
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": (tab !== 2),
                        }, "h-fit text-center p-2")}
                        onClick={() => setTab(2)}
                    >
                        할 일 목록
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-hidden">
                {(tab === 0) && (
                    <Scrollbars
                        className="w-full h-full" // bg-gray-100
                        universal
                        autoHide
                    >
                        <div className="p-2 space-y-2 flex flex-col">
                            {notices.map((notice) => (
                                <Link
                                    key={notice.id}
                                    className="p-4 block bg-white rounded-lg border border-gray-200 w-full"
                                    href={`/home/${notice.id}`}
                                >
                                    <div className={cn(
                                        "flex justify-between items-center",
                                    )}>
                                        <span className="font-semibold text-gray-800 text-lg">{notice.title}</span>
                                        <span className="text-sm text-gray-500">{(new Date(notice.update_time)).toLocaleString()}</span>
                                    </div>
                                    <hr className="my-2 border-gray-300"/>
                                    <div className="flex items-center justify-between gap-2">
                                        <Category category={notice.category}/>
                                        <Subject subject={notice.subject.name}/>
                                        <p className="ml-3 text-black flex-1 flex justify-end">
                                            {notice.user.name} 선생님
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {(notices.length === 0) && (
                                <div className="w-full flex justify-center h-full items-center">
                                    공지가 없습니다.
                                </div>
                            )}
                        </div>
                    </Scrollbars>
                )}
                {(tab === 1) && (
                    <div className="p-2 w-full h-full">
                        <Homeworks isMobile={true} />
                    </div>
                )}
            </div>
        </div>
    );
}
