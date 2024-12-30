"use client";

import Link from "next/link";
import {cn} from "@/app/components/functions";
import {usePathname} from "next/navigation";
import React from "react";
import {TodayQuestion} from "@/app/components/common";

export default function Navigation() {
    const path = usePathname();
    // const [answered, setAnswered] = useState(false);
    // const [showQuestion, setShowQuestion] = useState(false);

    return (
        <div className='fixed'>
            <TodayQuestion device="desktop"/>
            <nav className="min-w-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-between px-6 py-4">
                {/* 로고 자리 */}
                <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        JEET Education
                    </div>
                </div>
                {/* 네비게이션 링크 */}
                <div className="flex w-1/3 min-w-fit justify-around">
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
                </div>
            </nav>
        </div>
    );
}
