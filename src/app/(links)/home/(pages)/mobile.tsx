"use client";

import React, {useState} from "react";
import {cn} from "@/app/components/functions";
import Link from "next/link";

// 더 할 작업
// 1. 공지사항은 종류에 따라 색으로 구분, 기한 표시 등등
// 3. 디자인 좀 수정해야됨...(그림자 빼기 등)

export default function Mobile() {
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
        {text: "할 일 목록은 만들기 귀찮아요", completed: true},
        {text: "할 일 목록은 만들기 귀찮아요", completed: false},
        {text: "할 일 목록은 만들기 귀찮아요", completed: true},
        {text: "할 일 목록은 만들기 귀찮아요", completed: false},
        {text: "할 일 목록은 만들기 귀찮아요", completed: true},
        {text: "할 일 목록은 만들기 귀찮아요", completed: false},
        {text: "할 일 목록은 만들기 귀찮아요", completed: true},
        {text: "할 일 목록은 만들기 귀찮아요", completed: false},
        {text: "할 일 목록은 만들기 귀찮아요", completed: true},
        {text: "할 일 목록은 만들기 귀찮아요", completed: false},
    ];

    const [isInfo, setIsInfo] = useState(true);
    const [showCompletedTasks, setShowCompletedTasks] = useState(true);

    // 완료된 할 일의 개수 계산
    const completedTasks = todo.filter(task => task.completed).length;
    const totalTasks = todo.length;
    const progress = (completedTasks / totalTasks) * 100;

    const filteredTasks = showCompletedTasks
        ? todo
        : todo.filter(task => !task.completed);  // 완료된 할 일을 숨기면 완료되지 않은 할 일만 필터링

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
                    <div className="flex flex-col h-full">
                        <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                            {notifications.map((notification, index) => (
                                <Link
                                    href={`/notifications/${index}`}
                                    key={index}
                                    className="block w-full"
                                >
                                    <div className="p-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-full">
                                        {notification}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="h-fit mx-1 pb-1 text-center flex items-center justify-center">
                            <Link
                                className="component-button mx-1"
                                href={'/notifications'}
                            >
                                공지사항 보러가기
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="my-4 mx-6">
                            {/* 진행 상황 표시 */}
                            <div className="h-fit mx-1 pb-1 text-center flex items-center justify-center">
                                <span className="font-semibold text-gray-800">
                                    오늘의 할 일 {completedTasks}/{totalTasks}개 완료
                                </span>
                            </div>

                            {/* 진행률 표시 */}
                            <div className="w-full h-1 bg-gray-200 rounded-full my-4">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{width: `${progress}%`}}
                                />
                            </div>

                            <div className="flex justify-end w-full">
                                <button
                                    className="mx-1 text-gray-600"
                                    onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                                >
                                    {showCompletedTasks ? "완료한 일 숨기기" : "완료한 일 보이기"}
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                            {filteredTasks.map((task, index) => (
                                <Link
                                    href={`/homeworks/${index}`}
                                    key={index}
                                    className="block w-full"
                                >
                                    <div className={`px-4 py-3 mb-4 bg-white rounded-lg shadow-md border-2 ${task.completed ? "border-green-400 bg-green-50" : "border-gray-300"}`}>
                                        <div className="flex items-center">
                                        <span className={`${task.completed ? "text-green-600" : "text-gray-700"}`}>
                                            {task.text}
                                        </span>
                                            {task.completed && <div className="i-system-uicons-check"/>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="h-fit mx-1 pb-1 text-center flex items-center justify-center">
                            <Link
                                className="component-button mx-1"
                                href={'/homeworks'}
                            >
                                숙제 보러가기
                            </Link>
                            <Link
                                className="component-button mx-1"
                                href={'/home'}
                            >
                                오늘의 질문
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
