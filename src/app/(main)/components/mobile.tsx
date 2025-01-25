"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/app/(main)/components/functions"
import React from "react";
import {Alert, TodayQuestion} from "@/app/(main)/components/common";
import logo from "@/app/(others)/file/images/LOGO.png";
import Image from "next/image";

export function Navigation1() {
    const path = usePathname();
    return (
        <div className="nav">
            {/* 상단 로고 */}
            <header className="nav-header flex justify-between">
                <Image src={logo} alt="" height={25}/>
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
                        홈
                    </span>
                </Link>
                <Link href="/board" className="nav-item">
                    <span className={cn("_nav-item", {"bg-white": path === '/board'})}>
                        게시판
                    </span>
                </Link>
                <Link href="/timeTable" className="nav-item">
                    <span className={cn("_nav-item", {"bg-white": path === '/timeTable'})}>
                        시간표
                    </span>
                </Link>
                <Link href="/mypage" className="nav-item">
                    <span className={cn("_nav-item", {"bg-white": path === '/mypage'})}>
                        프로필
                    </span>
                </Link>
            </nav>
        </div>
    )} </>);
}