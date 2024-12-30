import React from "react";
import {cn} from "@/app/(main)/components/functions";
import Link from "next/link";

// 더 할 작업
// 1. 공지사항은 종류에 따라 색으로 구분, 기한 표시 등등
// 3. 디자인 좀 수정해야됨...(그림자 빼기 등)

export default function Mobile() {
    const chatInfos = [
        {title: "G3A", header: "나태양: I am SUN", time: "지금"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},
        {title: "반별 제목 예시", header: "마지막 대회 예시", time: "3분 전"},

    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-hidden">
                <div className="flex flex-col h-full">
                    <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                        {chatInfos.map((chat, index) => (
                            <Link
                                href={`/classroom/${index}`}
                                key={index}
                                className={cn("p-4 block mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-full")}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800 text-lg">{chat.title}</span>
                                    <span className="text-sm text-gray-500">{chat.time}</span>
                                </div>
                                <hr className="my-2 border-gray-300"/>
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 bg-gray-200 rounded-md"/>
                                    {/* 가능하다면? 채팅방 별 이미지를 설정할 수 있으면 좋지 않을까 하는 마음 */}
                                    <p className="ml-3 text-gray-500 text-base">{chat.header}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
