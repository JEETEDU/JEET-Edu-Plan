'use client'

import React, {useState} from "react";
import Scrollbars from "react-custom-scrollbars-2";
import TextareaAutosize from "react-textarea-autosize";
import {cn} from "@/app/(main)/components/functions";
import {Nanum_Pen_Script, Ubuntu} from "next/font/google";

const nanumPenScript = Nanum_Pen_Script({weight: "400", preload: false});
const ubuntu = Ubuntu({weight: "400", preload: false});

export default function Inquiry() {
    const [focus, setFocus] = useState<number>(0);

    return (
        <div className="grid grid-rows-3 gap-4 px-20 py-4 h-full text-gray-600">
            <div className="h-full grid grid-cols-4 row-span-2 hover:text-black">
                <div className="text-4xl font-bold flex items-center">
                    문의하기
                </div>
                <div className="col-span-3 bg-white shadow-xl p-8 flex flex-col gap-4 m-2 hover:m-0">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col w-full">
                            <div className="component-button-info">
                                이름
                            </div>
                            <div className={cn("border-2 rounded", {"border-gray": (focus === 1)})}>
                                <input
                                    type="text"
                                    className="outline-none bg-white py-2 px-3 w-full"
                                    placeholder="이름을 입력해 주세요"
                                    required
                                    onFocus={() => setFocus(1)}
                                    onBlur={() => setFocus(0)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="component-button-info">
                                연락처
                            </div>
                            <div className={cn("border-2 rounded", {"border-gray": (focus === 2)})}>
                                <input
                                    type="text"
                                    className="outline-none bg-white py-2 px-3 w-full"
                                    placeholder="연락처를 입력해 주세요"
                                    required
                                    onFocus={() => setFocus(2)}
                                    onBlur={() => setFocus(0)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col w-full">
                        <div className="component-button-info">
                            문의 내용
                        </div>
                        <div className={cn("flex-1 border-2 rounded", {"border-gray": (focus === 3)})}>
                            <Scrollbars
                                className="h-full"
                                universal
                                autoHide
                            >
                                <TextareaAutosize
                                    className="break-all resize-none min-h-full w-full bg-white outline-none px-3 py-2"
                                    placeholder="문의사항을 입력해주세요"
                                    onFocus={() => setFocus(3)}
                                    onBlur={() => setFocus(0)}
                                />
                            </Scrollbars>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-full grid grid-cols-4 hover:text-black ">
                <div className="text-4xl items-center grid grid-rows-3 w-full">
                    <div className={cn(nanumPenScript.className, "flex flex-col justify-end h-full")}>
                        안녕하세요,
                    </div>
                    <div className={cn(ubuntu.className)}>
                        JEET Edu Plan
                    </div>
                    <div className={cn(nanumPenScript.className, "flex flex-col justify-start h-full")}>
                        개발팀입니다.
                    </div>
                </div>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div className="bg-white shadow-xl p-8 flex flex-col gap-4 m-2 hover:m-0">
                        나태양 프로필
                    </div>
                    <div className="bg-white shadow-xl p-8 flex flex-col gap-4 m-2 hover:m-0">
                        김서호 프로필
                    </div>
                </div>
            </div>
        </div>
    )
}