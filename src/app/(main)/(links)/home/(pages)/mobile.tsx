"use client";

import React, {useEffect, useState} from "react";
import {cn, GET} from "@/app/(main)/components/functions";
import Link from "next/link";
import {IArticle, initArticle, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import Scrollbars from "react-custom-scrollbars-2";
import {Author, Category, Class_, Delete, Hr, Subject, Time, Title, Update} from "@/app/(main)/(links)/home/(pages)/desktop";

// 더 할 작업
// 1. 공지사항은 종류에 따라 색으로 구분, 기한 표시 등등
// 3. 디자인 좀 수정해야됨...(그림자 빼기 등)
// 3.1. 지금도 나쁘지 않을지도..?

export default function Mobile() {
    const [isInfo, setIsInfo] = useState(true);

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
                <div className="static h-fit grid grid-cols-2 w-screen">
                    <button
                        className={cn({
                            "bg-white pointer-events-none": isInfo,
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": !isInfo,
                        }, "h-fit text-center p-2")}
                        onClick={() => setIsInfo(!isInfo)}
                    >
                        공지사항
                    </button>
                    <button
                        className={cn({
                            "bg-white pointer-events-none": !isInfo,
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": isInfo,
                        }, "h-fit text-center p-2")}
                        onClick={() => setIsInfo(!isInfo)}
                    >
                        할 일 목록
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-hidden">
                {isInfo ? (
                    <Scrollbars
                        className="w-full h-full" // bg-gray-100
                        universal
                        autoHide
                    >
                        <div className="p-2 space-y-2 flex flex-col h-full">
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
                                        <p className="ml-3 text-gray-500 flex-1 flex justify-end">
                                            여기엔 뭐넣지
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
                ) : (
                    <div className="flex flex-col h-full">
                        {/*<div className="my-4 mx-6">*/}
                        {/*    /!* 진행 상황 표시 *!/*/}
                        {/*    <div className="h-fit mx-1 pb-1 text-center flex items-center justify-center">*/}
                        {/*        <span className="font-semibold text-gray-800">*/}
                        {/*            오늘의 할 일 {completedTasks}/{totalTasks}개 완료*/}
                        {/*        </span>*/}
                        {/*    </div>*/}

                        {/*    /!* 진행률 표시 *!/*/}
                        {/*    <div className="w-full h-1 bg-gray-200 rounded-full my-4">*/}
                        {/*        <div*/}
                        {/*            className="h-full bg-blue-500 rounded-full"*/}
                        {/*            style={{width: `${progress}%`}}*/}
                        {/*        />*/}
                        {/*    </div>*/}

                        {/*    <div className="flex justify-end w-full">*/}
                        {/*        <button*/}
                        {/*            className="mx-1 text-gray-600"*/}
                        {/*            onClick={() => setShowCompletedTasks(!showCompletedTasks)}*/}
                        {/*        >*/}
                        {/*            {showCompletedTasks ? "완료한 일 숨기기" : "완료한 일 보이기"}*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/*<div className="flex-grow overflow-y-auto p-4 bg-gray-100">*/}
                        {/*    {filteredTasks.map((task, index) => (*/}
                        {/*        <Link*/}
                        {/*            href={`/homeworks/${index}`}*/}
                        {/*            key={index}*/}
                        {/*            className="block w-full"*/}
                        {/*        >*/}
                        {/*            <div className={`px-4 py-3 mb-4 bg-white rounded-lg shadow-md border-2 ${task.completed ? "border-green-400 bg-green-50" : "border-gray-300"}`}>*/}
                        {/*                <div className="flex items-center">*/}
                        {/*                <span className={`${task.completed ? "text-green-600" : "text-gray-700"}`}>*/}
                        {/*                    {task.text}*/}
                        {/*                </span>*/}
                        {/*                    {task.completed && <div className="i-system-uicons-check"/>}*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        </Link>*/}
                        {/*    ))}*/}
                        {/*</div>*/}
                        {/*<div className="h-fit mx-1 pb-1 text-center flex items-center justify-center">*/}
                        {/*    <Link*/}
                        {/*        className="component-button mx-1"*/}
                        {/*        href={'/homeworks'}*/}
                        {/*    >*/}
                        {/*        숙제 보러가기*/}
                        {/*    </Link>*/}
                        {/*    <Link*/}
                        {/*        className="component-button mx-1"*/}
                        {/*        href={'/home'}*/}
                        {/*    >*/}
                        {/*        할 일 추가하기*/}
                        {/*    </Link>*/}
                        {/*</div>*/}
                    </div>
                )}
            </div>
        </div>
    );
}
