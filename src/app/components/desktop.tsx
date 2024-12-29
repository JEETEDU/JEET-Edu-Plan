"use client";

import Link from "next/link";
import {cn} from "@/app/components/functions";
import {usePathname} from "next/navigation";
// import {useCookies} from "next-client-cookies";

export default function Navigation() {
    const path = usePathname();
    // const cookies = useCookies();

    // console.log(`navigation: ${cookies.get('user')}`)

    return (
        <div className='fixed'>
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
                    <Link href={"/"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/home'})}>
                            Classroom
                        </span>
                    </Link>
                    <Link href={"/"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/home'})}>
                            Time Table
                        </span>
                    </Link>
                    <Link href={"/"} className="nav-item">
                        <span className={cn("_nav-item", {"bg-white": path === '/home'})}>
                            My Page
                        </span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
