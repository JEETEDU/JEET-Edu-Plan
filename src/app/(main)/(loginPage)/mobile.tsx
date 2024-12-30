"use client";

import Link from "next/link";
import React, {useState} from "react";
import {cn} from "@/app/(main)/components/functions";

export default function Mobile() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    return (
        <>
            {/* 부모 컨테이너에 Flexbox 적용 */}
            <div className="component-container p-4">
                <div className="grid grid-cols-2 component-form mb-4 p-0 max-w-xs">
                    <button
                        className={cn({"bg-white pointer-events-none": isLogin, "bg-gray-300 hover:bg-gray-200 transition duration-200": !isLogin}, "h-fit rounded-l-lg text-center p-2")}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        Login
                    </button>
                    <button
                        className={cn({"bg-white pointer-events-none": !isLogin, "bg-gray-300 hover:bg-gray-200 transition duration-200": isLogin}, "h-fit rounded-r-lg text-center p-2")}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        Sign Up
                    </button>
                </div>
                <div className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-lg p-6">
                    <h2 className="title-2">
                        {isLogin ? "로그인" : "회원 가입"}
                    </h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="name" className="component-button-info">
                                Name:
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="component-input"
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="component-button-info">
                                Password:
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="component-input"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <div className={showPassword ? "i-system-uicons-eye" : "i-system-uicons-eye-closed"}/>
                                    {/* 비밀번호 보기 아이콘 */}
                                </button>
                            </div>
                        </div>

                        {isLogin ? <></> :
                            <div>
                                <label htmlFor="name" className="component-button-info">
                                    머 적당히 가입할 때 필요한 정보들
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="component-input"
                                    placeholder="뭐가 필요할까"
                                    required
                                />
                            </div>
                        }

                        <div className={cn("flex items-center content-end justify-end")}>
                            <label className="flex items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Remember me</span>
                                <input type="checkbox" className="ml-2"/>
                            </label>
                        </div>

                        <div className="flex flex-col items-center space-y-4">
                            <Link
                                className="component-button"
                                href={'/home'}
                            >
                                {isLogin ? "Login" : "Sign Up"}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
