"use client";

// import Link from "next/link";
import React, {useState} from "react";
import {cn, POST} from "@/app/(main)/components/functions";
import {useRouter} from "next/navigation";

export default function Mobile() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    const login = async () => {
        const res = await POST('/api/user/login', {
            login_id: document.getElementById("id").value,
            pw: document.getElementById("password").value
        })
        if (res.success) {
            router.push('/home');
        } else {
            setError(res.message);
        }
    }

    const register = async () => {
        const res = await POST('/api/user/register', {
            name: document.getElementById("name").value,
            login_id: document.getElementById("id").value,
            pw: document.getElementById("password").value
        })
        if (res.success) {
            router.push('/home');
        } else {
            setError(res.message);
        }
    }

    return (
        <>
            {/* 부모 컨테이너에 Flexbox 적용 */}
            <div className="component-container p-4">
                <div className="grid grid-cols-2 component-form mb-4 p-0 max-w-xs">
                    <button
                        className={cn({"bg-white pointer-events-none": isLogin, "bg-gray-300 hover:bg-gray-200 transition duration-200": !isLogin}, "h-fit rounded-l-lg text-center p-2")}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        로그인
                    </button>
                    <button
                        className={cn({"bg-white pointer-events-none": !isLogin, "bg-gray-300 hover:bg-gray-200 transition duration-200": isLogin}, "h-fit rounded-r-lg text-center p-2")}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        회원가입
                    </button>
                </div>
                <div className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-lg p-6">
                    <h2 className="title-2">
                        {isLogin ? "로그인" : "회원 가입"}
                    </h2>
                    <form className="space-y-4">
                        {isLogin ? <></> :
                            <div>
                                <label htmlFor="name" className="component-button-info">
                                    이름:
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="component-input"
                                    placeholder="이름을 입력해 주세요"
                                    required
                                />
                            </div>
                        }

                        <div>
                            <label htmlFor="name" className="component-button-info">
                                아이디:
                            </label>
                            <input
                                type="text"
                                id="id"
                                className="component-input"
                                placeholder="아이디를 입력해주세요"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="component-button-info">
                                비밀번호:
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="component-input"
                                    placeholder="비밀번호를 입력해주세요"
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

                        {/*<div className={cn("flex items-center content-end justify-end")}>*/}
                        {/*    <label className="flex items-center">*/}
                        {/*        <span className="text-sm text-gray-600 dark:text-gray-300">Remember me</span>*/}
                        {/*        <input type="checkbox" className="ml-2"/>*/}
                        {/*    </label>*/}
                        {/*</div>*/}

                        <div className="flex flex-col items-center space-y-4">
                            <div className='text-red-600 font-bold'>
                                {error}
                            </div>
                            <button
                                className="component-button"
                                onClick={isLogin ? login : register}
                            >
                                {isLogin ? "로그인" : "회원가입"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
