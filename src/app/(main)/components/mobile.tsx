"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn, getStoreData} from "@/app/(main)/components/functions"
import React, {useEffect, useState} from "react";
import {Alert, TodayQuestion} from "@/app/(main)/components/common";
import logo from "@/images/LOGO.png";
import Image from "next/image";

export function Navigation1() {
    const path = usePathname();
    return (
        <div className="nav">
            {/* 상단 로고 */}
            <header className="nav-header flex justify-between">
                <Image src={logo} alt="" height={25} priority={true}/>
                <Alert path={path} isMobile={true}/>
            </header>
        </div>
    );
}

export function Navigation2() {
    const path = usePathname();
    const [userType, setUserType] = useState<number>(0);

    useEffect(() => {
        (async () => {
            if (path === '/') setUserType(0);
            else {
                const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;
                if (userInfo) setUserType(userInfo.user_type);
            }
        })();
    }, [path])

    return (<> {path !== '/' && (
        <div className="nav">
            <TodayQuestion device="mobile"/>

            {/* 네비게이션 링크 (하단 고정) */}
            <nav className="nav-bar">
                <Link href="/home" className="nav-item">
                    <div className={cn("_nav-item border-2", {"bg-white": path === '/home'})}>
                        {/*공지*/}
                        <div className="i-system-uicons:home-door"/>
                    </div>
                </Link>
                {(userType === 1) && (
                    <Link href="/book" className="nav-item">
                        <div className={cn("_nav-item border-2", {"bg-white": path === '/book'})}>
                            {/*독서록*/}
                            <div className="i-system-uicons:book-text"/>
                        </div>
                    </Link>
                )}
                <Link href="/board" className="nav-item">
                    <div className={cn("_nav-item border-2", {"bg-white": path === '/board'})}>
                        {/*게시판*/}
                        <div className="i-system-uicons:clipboard"/>
                    </div>
                </Link>
                <Link href="/timeTable" className="nav-item">
                    <div className={cn("_nav-item border-2", {"bg-white": path === '/timeTable'})}>
                        {/*시간표*/}
                        <div className="i-system-uicons:clock"/>
                    </div>
                </Link>
                <Link href="/mypage" className="nav-item">
                    <div className={cn("_nav-item border-2", {"bg-white": path === '/mypage'})}>
                        {/*프로필*/}
                        <div className="i-system-uicons:user-male"/>
                    </div>
                </Link>
            </nav>
        </div>
    )} </>);
}