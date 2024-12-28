"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/app/components/functions"
import React, {useState} from "react";
import Alert from "@/app/components/mobile/Alert";

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
    // const answer = () => setAnswered((prev) => !prev);

    return (
        <>
            <div className="nav">
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
                {!answered && (
                    123
                )}
            </div>

        </>
    );
}