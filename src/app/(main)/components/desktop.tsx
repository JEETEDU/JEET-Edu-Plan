"use client";

import Link from "next/link";
import {cn, getStoreData} from "@/app/(main)/components/functions";
import {usePathname} from "next/navigation";
import React, {useEffect, useState} from "react";
import {Alert, TodayQuestion} from "@/app/(main)/components/common";
import {useRouter} from "next/navigation";

import logo from "@/images/LOGO.png"
import Image from "next/image";

export default function Navigation() {
    const path = usePathname();
    const [userType, setUserType] = useState<number>(0);

    useEffect(() => {
        (async () => {
            const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;
            if (userInfo) setUserType(userInfo.user_type);
        })();
    }, [path])

    const router = useRouter();

    return (
        <div className='nav'>
            {(path !== '/') && <TodayQuestion device="desktop"/>}
            <div className="bg-gray-100 flex items-center justify-between p-4">
                {/* 로고 자리 */}
                <div className="flex flex-row gap-4 justify-start items-center">
                    <Image src={logo} alt="" priority={true} height={40} className="cursor-pointer md:hover:bg-white p-2 rounded" onClick={() => router.push('/home')}/>
                    <Link href={"/contact"} className="nav-item">
                        <div className={cn("_nav-item", {"bg-white": path === '/contact'})}>
                            문의하기
                        </div>
                    </Link>
                </div>
                {/*<button*/}
                {/*    className="bg-red-600 p-2 rounded-xl text-white font-bold"*/}
                {/*    onClick={() => {*/}
                {/*        sessionStorage.clear();*/}
                {/*        window.location.reload();*/}
                {/*    }}*/}
                {/*>*/}
                {/*    강제 새로고침*/}
                {/*</button>*/}
                <div className="flex items-center space-x-4 min-w-1/3 justify-between">
                    <div className={cn("grid flex-1 justify-between items-center min-w-fit", (userType === 1) ? "grid-cols-5" : "grid-cols-4")}>
                        {(userType !== 0) && (<>
                            <Link href={"/home"} className="nav-item">
                                <div className={cn("_nav-item", {"bg-white": path === '/home'})}>
                                    공지
                                </div>
                            </Link>
                            {(userType === 1) && (
                                <Link href={"/book"} className="nav-item">
                                    <div className={cn("_nav-item", {"bg-white": path === '/book'})}>
                                        독서록
                                    </div>
                                </Link>
                            )}
                            <Link href={"/board"} className="nav-item">
                                <div className={cn("_nav-item", {"bg-white": path === '/board'})}>
                                    게시판
                                </div>
                            </Link>
                            <Link href={"/timeTable"} className="nav-item">
                                <div className={cn("_nav-item", {"bg-white": path === '/timeTable'})}>
                                    시간표
                                </div>
                            </Link>
                            <Link href={"/mypage"} className="nav-item">
                                <div className={cn("_nav-item", {"bg-white": path === '/mypage'})}>
                                    프로필
                                </div>
                            </Link>
                        </>)}
                    </div>
                    <Alert path={path} isMobile={false}/>
                </div>
            </div>
        </div>
    );
}
