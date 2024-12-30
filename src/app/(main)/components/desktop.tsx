"use client";

import Link from "next/link";
import {cn} from "@/app/(main)/components/functions";
import {usePathname} from "next/navigation";
import React, {useState} from "react";
import {TodayQuestion} from "@/app/(main)/components/common";

export default function Navigation() {
    const path = usePathname();
    const [isModalOpen, setModalOpen] = useState(false);
    const toggleModal = () => setModalOpen((prev) => !prev);

    return (
        <div className='nav'>
            {path !== '/' && <TodayQuestion device="desktop"/>}
            <nav className="min-w-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-between px-6 py-4">
                {/* 로고 자리 */}
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        JEET Education
                    </div>
                </div>
                {/* 네비게이션 링크 */}
                <div className="flex w-1/3 min-w-fit justify-around items-center min-w-fit">
                    <Link href={"/home"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/home'})}>
                            Home
                        </span>
                    </Link>
                    <Link href={"/classroom"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/classroom'})}>
                            Classroom
                        </span>
                    </Link>
                    <Link href={"/timeTable"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/timeTable'})}>
                            Time Table
                        </span>
                    </Link>
                    <Link href={"/mypage"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/mypage'})}>
                            My Page
                        </span>
                    </Link>
                    {path !== '/' && (
                        <div className="ml-2">
                            <div onClick={toggleModal} className="i-system-uicons-bell"/>
                            {/* If there exist unread notice, "i-system-uicons-bell-ringing"   */}
                        </div>
                    )}
                </div>

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

            </nav>
        </div>
    );
}
