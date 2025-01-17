"use client";

import React, {useState} from "react";
import {cn} from "@/app/(main)/components/functions";
import Link from "next/link";
import Scrollbars from "react-custom-scrollbars-2";

export default function Desktop() {
    const [isInfo, setIsInfo] = useState(true);
    const [head, setHead] = useState(0);
    const [isTeacher, setIsTeacher] = useState(true);

    const notifications = [
        "이 알림은 테스트 메시지입니다.",
        "새로운 알림이 도착했습니다!",
        "오늘 할 일을 체크하세요.",
        "이벤트 참여 기회를 놓치지 마세요.",
        "보안 업데이트가 필요합니다.",
        "새로운 메시지가 있습니다.",
        "친구 요청을 확인하세요.",
        "업데이트 알림: 새로운 기능이 추가되었습니다.",
        "건강 체크를 위한 알림입니다.",
        "계정 설정을 확인하세요.",
        "새로운 알림이 도착했습니다!",
        "오늘 할 일을 체크하세요.",
        "이벤트 참여 기회를 놓치지 마세요.",
        "보안 업데이트가 필요합니다.",
        "새로운 메시지가 있습니다.",
        "친구 요청을 확인하세요.",
        "업데이트 알림: 새로운 기능이 추가되었습니다.",
        "건강 체크를 위한 알림입니다.",
        "계정 설정을 확인하세요.",
        "이 알림은 테스트 메시지입니다.",
    ];

    const todo = [
        {title: "할 일 목록은 만들기 귀찮아요", done: true, due: "12/31"},
    ];

    const headNotification = {
        content: "1월 10일에 겨울학기가 시작합니다.",
    };

    return (
        <>
            <div className="h-full flex flex-col">
                <div className={cn(
                    "text-center text-3xl py-2 bg-gray-100 border-red-600 border-8 h-fit"
                )}>
                    {headNotification.content}
                </div>
                {isInfo ? (
                    <div className="flex-1 grid grid-cols-3 overflow-hidden bg-gray-100"> {/* hear */}
                        <div className="col-span-2 bg-white mt-2 mx-4 rounded-lg border">
                            <div className="flex flex-col gap-5 h-full w-full items-center justify-center">
                                <div className="text-center text-4xl">
                                    {notifications[head]}
                                </div>
                                <div>
                                    여기에는 상세 내용이 자세하게 보이게 하고싶다
                                </div>
                            </div>
                        </div>
                        <Scrollbars
                            className="w-full h-full" // bg-gray-100
                            universal
                            autoHide
                        >
                            <div className="p-2 space-y-2">
                                {notifications.map((notification, index) => (
                                    <button
                                        key={index}
                                        className="block w-full"
                                        onClick={() => setHead(index)}
                                    >
                                        <div className={cn(
                                            "p-3 hover:bg-gray-100 rounded-lg border border-gray-200 w-full",
                                            (index === head) ? "bg-gray-200" : "bg-white"
                                        )}>
                                            {notification}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Scrollbars>
                    </div>
                    ) : (
                    <div className="flex-1 grid grid-cols-2 overflow-hidden">
                        <div className="overflow-hidden bg-gray-100 flex flex-col px-4 pt-4">
                            <div className="text-center text-2xl mb-4">
                                숙제 목록
                            </div>
                            <Scrollbars
                                className="w-full h-full"
                                universal
                                autoHide
                            >
                                {notifications.map((notification, index) => (
                                    <Link
                                        key={index}
                                        className="block w-full"
                                        href={'/'}
                                    >
                                        <div className={cn(
                                            "p-3 mb-2 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 w-full",
                                            "bg-white"
                                        )}>
                                            {notification}
                                        </div>
                                    </Link>
                                ))}
                            </Scrollbars>
                        </div>
                        <div className="overflow-hidden pt-4 px-4 bg-gray-100 flex flex-col">
                            <div className="text-center text-2xl mb-4">
                                내 할일 목록
                            </div>
                            <Scrollbars
                                className="w-full h-full"
                                universal
                                autoHide
                            >
                                {notifications.map((notification, index) => (
                                    <Link
                                        key={index}
                                        className="block w-full"
                                        href={'/'}
                                    >
                                        <div className={cn(
                                            "p-3 mb-2 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 w-full",
                                            "bg-white"
                                        )}>
                                            {notification}
                                        </div>
                                    </Link>
                                ))}
                            </Scrollbars>
                        </div>
                    </div>
                )}
                <div className="bg-gray-100 p-4 grid grid-cols-3 w-full items-center">
                    <div className="flex justify-start">
                        <Link
                            className="bg-white hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5"
                            // onClick={() => setIsTeacher(!isTeacher)}
                            href={'/home/new'}
                        >
                            공지 추가하기
                        </Link>
                    </div>

                    <div className="flex justify-center">
                        <div className="p-0 rounded-2xl shadow-2xl pointer-events-auto grid grid-cols-2 component-form">
                            <button
                                className={cn(
                                    {
                                        "bg-white pointer-events-none": isInfo,
                                        "bg-gray-300 hover:bg-gray-200 transition duration-200": !isInfo,
                                    },
                                    "h-fit rounded-l-lg text-center p-2"
                                )}
                                onClick={() => setIsInfo(!isInfo)}
                            >
                                학원 공지사항
                            </button>
                            <button
                                className={cn(
                                    {
                                        "bg-white pointer-events-none": !isInfo,
                                        "bg-gray-300 hover:bg-gray-200 transition duration-200": isInfo,
                                    },
                                    "h-fit rounded-r-lg text-center p-2"
                                )}
                                onClick={() => setIsInfo(!isInfo)}
                            >
                                할 일 목록
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            className={cn(
                                "bg-white hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5",
                                {"invisible": isInfo}
                            )}
                            onClick={() => setIsTeacher(!isTeacher)}
                        >
                            내 할일 추가하기
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}