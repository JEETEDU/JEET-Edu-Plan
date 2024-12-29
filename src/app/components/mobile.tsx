"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/app/components/functions"
import React, {useState} from "react";

export function Navigation1() {
    const [isModalOpen, setModalOpen] = useState(false);
    const toggleModal = () => setModalOpen((prev) => !prev);
    return (
        <div className="nav">
            {/* 상단 로고 */}
            <header className="nav-header flex justify-between">
                <div className="nav-title">
                    JEET Education
                </div>
                <div>
                    <div onClick={toggleModal} className="i-system-uicons-bell"/>
                    {/* If there exist unread notice, "i-system-uicons-bell-ringing"   */}
                </div>
            </header>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
                    onClick={toggleModal} // 모달 바깥 클릭 시 닫힘
                >
                    <div
                        className="bg-white rounded-lg shadow-lg p-6 w-96"
                        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                    >
                        <h2 className="text-xl font-bold mb-4">알림</h2>
                        <ul>
                            <li>읽지 않은 알림이 없습니다.</li>
                        </ul>
                        <button
                            onClick={toggleModal}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function Navigation2() {
    const path = usePathname();
    const [answered, setAnswered] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const toggleModal = () => setShowQuestion((prev) => !prev);
    // const answer = () => setAnswered((prev) => !prev);

    return (<> {path !== '/' && (
        <div className="nav">
            {!answered && (
                <div className="fixed inset-0 flex items-end justify-end z-10 pointer-events-none">
                    <div
                        className="p-3 rounded-2xl bg-blue-400 shadow-2xl hover:bg-blue-500 mb-15 mr-3 border border-blueGray pointer-events-auto"
                        onClick={toggleModal}
                    >
                        오늘의 질문
                    </div>
                </div>
            )}
            {showQuestion && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
                    onClick={toggleModal} // 모달 바깥 클릭 시 닫힘
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
                                    onClick={() => {setAnswered(!answered); setShowQuestion(!showQuestion)}} // 이거 나중에는 <Link/>로 바꿔야됨
                                >
                                    제출하기
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 네비게이션 링크 (하단 고정) */}
            <nav className="nav-bar">
                <Link href="/home" className="nav-item">
                    <span className={cn("_nav-item", {"bg-white": path === '/home'})}>
                        Home
                    </span>
                </Link>
                <Link href="/classroom" className="nav-item">
                    <span className={cn("_nav-item", {"bg-white": path === '/classroom'})}>
                        Classroom
                    </span>
                </Link>
                <Link href="/timeTable" className="nav-item">
                    <span className={cn("_nav-item", {"bg-white": path === '/timeTable'})}>
                        Time Table
                    </span>
                </Link>
                <Link href="/mypage" className="nav-item">
                    <span className={cn("_nav-item", {"bg-white": path === '/mypage'})}>
                        My Page
                    </span>
                </Link>
            </nav>
        </div>
    )} </>);
}