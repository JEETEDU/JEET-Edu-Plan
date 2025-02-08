"use client";

import React, {useEffect, useRef, useState} from "react";
import {cn, GET, getStoreData} from "@/app/(main)/components/functions";
import Link from "next/link";
import {IArticle} from "@/app/(main)/(links)/board/component";
import Scrollbars from "react-custom-scrollbars-2";
import {Category, IResponseNotices, Subject} from "@/app/(main)/(links)/home/(pages)/desktop";
import Homeworks from "@/app/(main)/(links)/home/components/homeworks";
import Todo from "@/app/(main)/(links)/home/components/todo";

export default function Mobile() {
    const [tab, setTab] = useState<number>(0);
    const [notices, setNotices] = useState<IArticle[]>([]);
    const [page, setPage] = useState<number>(1);
    const [userType, setUserType] = useState<number>(1);

    function reload(append: boolean = false) {
        (async () => {
            const res: IResponseNotices = await GET(`/api/user/notice?page=${page}`);
            if (res.success) {
                if (append) {
                    setNotices(prev => [...prev, ...(res.notices)]);
                } else {
                    setNotices(res.notices);
                }
            } else {
                setNotices([]);
            }
        })();
    }

    useEffect(() => {
        if (tab === 0) {
            setPage(1);
            reload();
        }
    }, [tab])

    useEffect(() => {
        (async () => {
            setUserType((await getStoreData('/api/user/info', 'user-info')).response.user.user_type);
        })();
    }, []);

    useEffect(() => {
        if (page > 1) reload(true);
    }, [page]);

    const scrollbars = useRef<Scrollbars>(null);

    return (
        <div className="flex flex-col h-full w-full">
            <div className={cn("h-fit w-full", (userType === 1) ? "grid grid-cols-3" : "flex justify-center bg-white")}>
                <button
                    className={cn({
                        "bg-white pointer-events-none": (tab === 0),
                        "bg-gray-300 lg:hover:bg-gray-200 transition duration-200": (tab !== 0),
                    }, "h-fit text-center p-2")}
                    onClick={() => setTab(0)}
                >
                    공지사항
                </button>
                {(userType === 1) && (<>
                        <button
                            className={cn({
                                "bg-white pointer-events-none": (tab === 1),
                                "bg-gray-300 lg:hover:bg-gray-200 transition duration-200": (tab !== 1),
                            }, "h-fit text-center p-2")}
                            onClick={() => setTab(1)}
                        >
                            숙제
                        </button>
                        <button
                            className={cn({
                                "bg-white pointer-events-none": (tab === 2),
                                "bg-gray-300 lg:hover:bg-gray-200 transition duration-200": (tab !== 2),
                            }, "h-fit text-center p-2")}
                            onClick={() => setTab(2)}
                        >
                            할 일 목록
                        </button>
                    </>
                )}
            </div>

            <div className="flex-grow overflow-hidden">
                {(tab === 0) && (
                    <Scrollbars
                        className="w-full h-full" // bg-gray-100
                        universal
                        autoHide
                        ref={scrollbars}
                        onScroll={() => {
                            if (scrollbars.current!.getScrollHeight() - scrollbars.current!.getClientHeight() <= scrollbars.current!.getScrollTop() + 10) {
                                if (notices.length === 10 * page) {
                                    setPage(p => p + 1);
                                }
                            }
                        }}
                    >
                        <div className="p-2 space-y-2 flex flex-col">
                            {notices.map((notice) => (
                                <Link
                                    key={notice.id}
                                    className="p-2 block bg-white rounded border border-gray-200 w-full gap-2"
                                    href={`/home/${notice.id}`}
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <div className="font-semibold text-gray-800 text-lg whitespace-nowrap truncate">
                                            {notice.title}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-sm text-gray-500 whitespace-nowrap">
                                                {(new Date(notice.update_time)).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500 whitespace-nowrap">
                                                {(new Date(notice.update_time)).toLocaleTimeString()}
                                            </div>
                                        </div>
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
                        <Homeworks isMobile={true}/>
                    </div>
                )}
                {(tab === 2) && (
                    <div className="p-2 w-full h-full">
                        <Todo isMobile={true}/>
                    </div>
                )}
            </div>
        </div>
    );
}
