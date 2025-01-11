"use client";

import React, {useState} from "react";
import {cn} from "@/app/(main)/components/functions";
import Link from "next/link";
import Chatting from "@/app/(main)/(links)/classroom/[id]/mobile";
import Scrollbars from "react-custom-scrollbars-2";

export default function Desktop() {
    const [head, setHead] = useState(0);
    const [isTeacher, setIsTeacher] = useState(true);

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
        <>
            <div className="h-full flex flex-col">
                <div className="grid grid-cols-3 overflow-hidden flex-grow"> {/* hear */}
                    <div className="col-span-2 flex flex-col">
                        <div className="flex-grow w-full">
                            <Chatting id={head}/>
                        </div>
                    </div>
                    <div className="flex-grow bg-gray-100">
                        <Scrollbars
                            className="w-full h-full"
                            universal
                            autoHide
                        >
                            <div className="px-4">
                                {chatInfos.map((chat, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "p-4 block mb-2 bg-white rounded-lg border border-gray-200 w-full",
                                            (index === head) ? "border-2 border-black" : ""
                                        )}
                                        onClick={() => setHead(index)}
                                    >
                                        <div className={cn(
                                            "flex justify-between items-center",
                                        )}>
                                            <span className="font-semibold text-gray-800 text-lg">{chat.title}</span>
                                            <span className="text-sm text-gray-500">{chat.time}</span>
                                        </div>
                                        <hr className="my-2 border-gray-300"/>
                                        <div className="flex items-center justify-between">
                                            <div className="w-8 h-8 bg-gray-200 rounded-md"/>
                                            {/* 가능하다면? 채팅방 별 이미지를 설정할 수 있으면 좋지 않을까 하는 마음 */}
                                            <p className="ml-3 text-gray-500 text-base">{chat.header}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Scrollbars>
                    </div>
                </div>

                <div className="bg-gray-100 p-4 grid grid-cols-3 w-full items-center">
                    <div className="flex justify-start">

                    </div>

                    <div className="flex justify-center">
                        <div className="p-0 rounded-2xl shadow-2xl pointer-events-auto grid grid-cols-2 component-form">

                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            className={cn(
                                "bg-white hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5",
                                {"invisible": !isTeacher}
                            )}
                            onClick={() => {
                                setIsTeacher(!isTeacher);
                                alert('게시글 추가 창으로 연결해야됨')
                            }}
                        >
                            게시글 추가하기
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}