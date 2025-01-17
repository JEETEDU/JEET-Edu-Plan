"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/app/(main)/components/functions"
import React, {useState} from "react";
import {Alert, TodayQuestion} from "@/app/(main)/components/common";

export function Navigation1() {
    const path = usePathname();
    return (
        <div className="nav">
            {/* 상단 로고 */}
            <header className="nav-header flex justify-between">
                <div className="nav-title">
                    JEET Education
                </div>
                <Alert path={path} isMobile={true}/>
            </header>
        </div>
    );
}

export function Navigation2() {
    const path = usePathname();

    return (<> {path !== '/' && (
        <div className="nav">
            <TodayQuestion device="mobile"/>

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