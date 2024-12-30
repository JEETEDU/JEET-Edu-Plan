'use client';

import {cn} from "@/app/components/functions";
import React, {useState} from "react";
import {usePathname} from "next/navigation";

export function TodayQuestion({device}: {device}) {
    const path = usePathname();
    const [answered, setAnswered] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);

    return (<>
        {!answered && (
            <div className="fixed inset-0 flex items-end justify-end z-5 pointer-events-none">
                <div
                    className={cn(
                        "p-3 rounded-2xl bg-blue-400 shadow-2xl hover:bg-blue-500 border border-blueGray pointer-events-auto",
                        (device === 'desktop') ?
                            "m-8 text-xl" :
                            cn("mr-3", (path === '/home') ? "mb-25" : "mb-15")
                    )}
                    onClick={() => setShowQuestion(!showQuestion)}
                >
                    오늘의 질문 답하기
                </div>
            </div>
        )}
        {showQuestion && (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
                onClick={() => setShowQuestion(!showQuestion)} // 모달 바깥 클릭 시 닫힘
            >
                <div
                    className="bg-white rounded-lg shadow-lg p-6 w-96"
                    onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                >
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="component-button-info">
                                여기에는 또
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="component-input"
                                placeholder="어떤 질문들이"
                                required
                            />
                        </div>

                        {/*<div>*/}
                        {/*    <label htmlFor="password" className="component-button-info">*/}
                        {/*        Password:*/}
                        {/*    </label>*/}
                        {/*    <div className="relative">*/}
                        {/*        <input*/}
                        {/*            type={showPassword ? "text" : "password"}*/}
                        {/*            id="password"*/}
                        {/*            className="component-input"*/}
                        {/*            placeholder="Enter your password"*/}
                        {/*            required*/}
                        {/*        />*/}
                        {/*        <button*/}
                        {/*            type="button"*/}
                        {/*            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"*/}
                        {/*            onClick={() => setShowPassword(!showPassword)}*/}
                        {/*        >*/}
                        {/*            <div className={showPassword ? "i-system-uicons-eye" : "i-system-uicons-eye-closed"}/>*/}
                        {/*            /!* 비밀번호 보기 아이콘 *!/*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        <div>
                            <label htmlFor="name" className="component-button-info">
                                들어가면
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="component-input"
                                placeholder="좋을까용"
                                required
                            />
                        </div>

                        {/*<div className={cn("flex items-center content-end justify-end")}>*/}
                        {/*    <label className="flex items-center">*/}
                        {/*        <span className="text-sm text-gray-600 dark:text-gray-300">Remember me</span>*/}
                        {/*        <input type="checkbox" className="ml-2"/>*/}
                        {/*    </label>*/}
                        {/*</div>*/}

                        <div className="flex flex-col items-center space-y-4">
                            {/*<Link*/}
                            {/*    className="component-button"*/}
                            {/*    href={'/home'}*/}
                            {/*>*/}
                            {/*    제출하기*/}
                            {/*</Link>*/}
                            <div
                                className="component-button"
                                onClick={() => {
                                    setAnswered(!answered);
                                    setShowQuestion(!showQuestion)
                                }} // 이거 나중에는 <Link/>로 바꿔야됨
                            >
                                제출하기
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </>);
}