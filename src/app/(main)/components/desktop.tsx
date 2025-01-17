"use client";

import Link from "next/link";
import {cn} from "@/app/(main)/components/functions";
import {usePathname} from "next/navigation";
import React from "react";
import {Alert, TodayQuestion} from "@/app/(main)/components/common";

export default function Navigation() {
    const path = usePathname();

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
                <button
                    className="bg-red-600 p-2 rounded-xl text-white font-bold"
                    onClick={() => {
                        sessionStorage.clear();
                        window.location.reload();
                    }}
                >
                    강제 새로고침
                </button>
                {/* 네비게이션 링크 */}
                <div className="flex items-center space-x-4 w-1/3 justify-between">
                    <div className="flex flex-1 justify-between items-center min-w-fit">
                        <Link href={"/home"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/home'})}>
                            공지사항
                        </span>
                        </Link>
                        <Link href={"/classroom"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/classroom'})}>
                            게시판
                        </span>
                        </Link>
                        <Link href={"/timeTable"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/timeTable'})}>
                            시간표
                        </span>
                        </Link>
                        <Link href={"/mypage"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/mypage'})}>
                            프로필
                        </span>
                        </Link>
                    </div>
                    <Alert path={path} isMobile={false}/>
                </div>
            </nav>
        </div>
    );
}
