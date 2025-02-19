'use client'

import React, {useEffect, useState} from "react";
import Scrollbars from "react-custom-scrollbars-2";
import TextareaAutosize from "react-textarea-autosize";
import {cn} from "@/app/(main)/components/functions";
import {Nanum_Pen_Script, Ubuntu, Noto_Serif_KR} from "next/font/google";
import Image from "next/image";
import {sendContactEmail} from "@/app/(others)/api/email/(tools)/contact";

const nanumPenScript = Nanum_Pen_Script({weight: "400", preload: false});
const ubuntu = Ubuntu({weight: "400", preload: false});
const notoSerifKr = Noto_Serif_KR({weight: "700", preload: false});

export default function Inquiry() {
    const [focus, setFocus] = useState<number>(0);
    const [title, setTitle] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [contact, setContact] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [error, setError] = useState<[boolean, boolean, boolean, boolean]>([false, false, false, false]);

    useEffect(() => {
        setError([false, false, false, false]);
    }, [title, name, contact, content]);

    function submit() {
        if (!title.trim() || !name.trim() || !contact.trim() || !content.trim()) {
            setError([!title.trim(), !name.trim(), !contact.trim(), !content.trim()]);
            return;
        }
        sendContactEmail({
            title: title,
            name: name,
            contact: contact,
            content: content,
        }).then(r => {
            if (r.success) {
                alert("문의가 접수되었습니다.");
            }
        });
    }

    return (
        <div className="grid grid-rows-3 gap-4 px-20 py-4 h-full text-gray-600">
            <div className="h-full grid grid-cols-4 row-span-2 hover:text-black">
                <div className="text-4xl font-bold flex items-center">
                    문의하기
                </div>
                <div className="col-span-3 bg-white shadow-xl p-8 flex flex-col gap-4 m-2 hover:m-0">
                    <div className="grid grid-cols-4 gap-4">
                        <div className="flex flex-col w-full col-span-2">
                            <div className="component-button-info">
                                제목
                            </div>
                            <div className={cn("border-2 rounded", {"border-gray": (focus === 4)}, {"border-red-500": error[0]})}>
                                <input
                                    type="text"
                                    className="outline-none bg-white py-2 px-3 w-full"
                                    placeholder={error[0] ? "제목이 비어있습니다." : "제목을 입력해 주세요"}
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onFocus={() => setFocus(4)}
                                    onBlur={() => setFocus(0)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="component-button-info">
                                이름
                            </div>
                            <div className={cn("border-2 rounded", {"border-gray": (focus === 1)}, {"border-red-500": error[1]})}>
                                <input
                                    type="text"
                                    className="outline-none bg-white py-2 px-3 w-full"
                                    placeholder={error[1] ? "이름이 비어있습니다." : "이름을 입력해 주세요"}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    onFocus={() => setFocus(1)}
                                    onBlur={() => setFocus(0)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="component-button-info">
                                연락처 (Email or Call)
                            </div>
                            <div className={cn("border-2 rounded", {"border-gray": (focus === 2)}, {"border-red-500": error[2]})}>
                                <input
                                    type="text"
                                    className="outline-none bg-white py-2 px-3 w-full"
                                    placeholder={error[2] ? "연락처가 비어있습니다." : "연락처를 입력해 주세요"}
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
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
                        <div className={cn("flex-1 border-2 rounded", {"border-gray": (focus === 3)}, {"border-red-500": error[3]})}>
                            <Scrollbars
                                className="h-full"
                                universal
                                autoHide
                            >
                                <TextareaAutosize
                                    className="break-all resize-none min-h-full w-full bg-white outline-none px-3 py-2"
                                    placeholder={error[3] ? "내용이 비어있습니다." : "내용을 입력해 주세요"}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    onFocus={() => setFocus(3)}
                                    onBlur={() => setFocus(0)}
                                />
                            </Scrollbars>
                        </div>
                    </div>
                    <div className="w-full flex justify-center items-center">
                        <div
                            className="py-1 px-8 border-2 rounded hover:bg-white bg-gray-200 cursor-pointer"
                            onClick={() => submit()}
                        >
                            문의하기
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-full max-h-full grid grid-cols-4 hover:text-black ">
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
                <div className="col-span-3 grid grid-cols-2 gap-4 h-full max-h-full">
                    <div className="bg-white shadow-xl p-8 grid grid-cols-3 gap-8 m-2 hover:m-0 overflow-hidden items-center">
                        <div className="w-full flex flex-col justify-center h-full items-center">
                            <div className="h-25 w-25 p-2 border-2 rounded-full overflow-hidden flex justify-center items-center">
                                <Image
                                    src="https://avatars.githubusercontent.com/u/73592868?v=4"
                                    width={100}
                                    height={100}
                                    alt="image"
                                    priority={true}
                                />
                            </div>
                        </div>
                        <div className={cn(notoSerifKr.className, "flex-1 h-full flex flex-col justify-center col-span-2")}>
                            <div className="flex flex-col w-full justify-center items-center gap-2">
                                <div>
                                    backend developer
                                </div>
                                <div className="text-4xl">
                                    나 태 양
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 items-center justify-end gap-1">
                                <div className="flex flex-row w-full items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M20 18h-2V9.25L12 13L6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"/>
                                    </svg>
                                    <div className="flex flex-col flex-1 text-blue-400 hover:text-blue-600">
                                        dev@hegelty.me
                                    </div>
                                </div>
                                <div className="flex flex-row w-full items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
                                    </svg>
                                    <div className="flex flex-col flex-1 text-blue-400 hover:text-blue-600">
                                        github.com/hegelty
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white shadow-xl p-8 grid grid-cols-3 gap-8 m-2 hover:m-0 overflow-hidden items-center">
                        <div className="w-full flex flex-col justify-center h-full items-center">
                            <div className="h-25 w-25 border-2 rounded-full overflow-hidden flex justify-center items-center">
                                <Image
                                    src="https://avatars.githubusercontent.com/u/108274577?v=4"
                                    width={100}
                                    height={100}
                                    alt="image"
                                    priority={true}
                                />
                            </div>
                        </div>
                        <div className={cn(notoSerifKr.className, "flex-1 h-full flex flex-col justify-center col-span-2")}>
                            <div className="flex flex-col w-full justify-center items-center gap-2">
                                <div>
                                    frontend developer
                                </div>
                                <div className="text-4xl">
                                    김 서 호
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 items-center justify-end gap-1">
                                <div className="flex flex-row w-full items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M20 18h-2V9.25L12 13L6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"/>
                                    </svg>
                                    <div className="flex flex-col flex-1 text-blue-400 hover:text-blue-600">
                                        seoho7777.kim@gmail.com
                                    </div>
                                </div>
                                <div className="flex flex-row w-full items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/>
                                    </svg>
                                    <div className="flex flex-col flex-1 text-blue-400 hover:text-blue-600">
                                        github.com/seohokim-hoya
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}