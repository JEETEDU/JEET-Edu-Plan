"use client";

import Link from "next/link";
import React, {useState} from "react";
import {cn} from "@/app/(main)/components/functions";

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

    const headNotification = {
        content: "1월 10일에 겨울학기가 시작합니다.",
    };

    return (
        <>
            <div className="h-full">
                <div className={cn(
                    "text-center text-3xl py-2 bg-gray-100",
                    "border-red-600 border-8"
                )}>
                    {headNotification.content}
                </div>
                <div className="h-150 grid grid-cols-3"> {/* hear */}
                    <div className="col-span-2 border-15 border-gray-200">
                        <div className="flex flex-col gap-5 h-full w-full items-center justify-center">
                            <div className="text-center text-4xl">
                                {notifications[head]}
                            </div>
                            <div>
                                여기에는 상세 내용이 자세하게 보이게 하고싶다
                            </div>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-4 bg-gray-50">
                        {notifications.map((notification, index) => (
                            <div
                                key={index}
                                className="block w-full"
                                onClick={() => setHead(index)}
                            >
                                <div className={cn(
                                    "p-3 mb-2 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 w-full",
                                    (index === head) ? "bg-gray-200" : "bg-white"
                                )}>
                                    {notification}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="fixed items-end justify-center inset-0 flex z-5 pointer-events-none">
                <div
                    className="p-0 rounded-2xl shadow-2xl pointer-events-auto mb-10 grid grid-cols-2 component-form"
                    // onClick={() => setShowQuestion(!showQuestion)}
                >
                    <button
                        className={cn({
                            "bg-white pointer-events-none": isInfo,
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": !isInfo,
                        }, "h-fit rounded-l-lg text-center p-2")}
                        onClick={() => setIsInfo(!isInfo)}
                    >
                        공지사항
                    </button>
                    <button
                        className={cn({
                            "bg-white pointer-events-none": !isInfo,
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": isInfo,
                        }, "h-fit rounded-r-lg text-center p-2")}
                        onClick={() => setIsInfo(!isInfo)}
                    >
                        할 일 목록
                    </button>
                </div>
            </div>
            {isTeacher && (
                <div className="fixed items-end justify-start inset-0 flex z-7 pointer-events-none">
                    <div
                        className="p-0 rounded-2xl shadow-2xl pointer-events-auto grid mb-10 ml-10"
                        // onClick={() => setShowQuestion(!showQuestion)}
                    >
                        <button
                            className="bg-white hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5"
                            onClick={() => setIsTeacher(!isTeacher)}
                        >
                            공지 추가하기
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}