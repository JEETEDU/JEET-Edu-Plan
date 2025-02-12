'use client'

import React, {useState} from "react";
import Scrollbars from "react-custom-scrollbars-2";
import TextareaAutosize from "react-textarea-autosize";
import {cn} from "@/app/(main)/components/functions";

export default function Inquiry() {
    const [focus, setFocus] = useState<number>(0);

    return (
        <div className="grid grid-rows-3 gap-4 px-20 py-4 h-full">
            <div className="h-full grid grid-cols-3 row-span-2">
                <div className="grid grid-rows-2 gap-8 p-0">
                    <div className="text-4xl font-bold flex items-end justify-center">
                        문의하기
                    </div>
                    <div className="font-serif text-xl w-full flex justify-center">
                        &#34;안녕하세요, JEET Edu Plan 개발팀입니다.&#34;
                    </div>
                </div>
                <div
                    className="col-span-2 bg-white shadow-xl p-8 flex flex-col gap-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col w-full">
                            <div className="component-button-info">
                                이름
                            </div>
                            <div className={cn("border-2 rounded", {"border-gray": (focus === 1)})}>
                                <input
                                    type="text"
                                    className="outline-none bg-white py-2 px-3"
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
                                    className="outline-none bg-white py-2 px-3"
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
            <div>
                아아앍
            </div>
        </div>
    )
}