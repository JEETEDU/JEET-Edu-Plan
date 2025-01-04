"use client";

import React, {useState} from "react";
import {cn, post} from "@/app/(main)/components/functions";
import {useRouter} from "next/navigation";

export default function Desktop() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    const login = async () => {
        const res = await post('/api/user/login', {
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
        const res = await post('/api/user/register', {
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
            <div className="component-container">
                <div className="grid grid-cols-2 component-form mb-4 p-0">
                    <button
                        className={cn({
                            "bg-white pointer-events-none": isLogin,
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": !isLogin
                        }, "h-fit rounded-l-lg text-center p-2")}
                        onClick={() => {
                            setIsLogin(true);
                            setError("")
                        }}
                    >
                        로그인
                    </button>
                    <button
                        className={cn({
                            "bg-white pointer-events-none": !isLogin,
                            "bg-gray-300 hover:bg-gray-200 transition duration-200": isLogin
                        }, "h-fit rounded-r-lg text-center p-2")}
                        onClick={() => {
                            setIsLogin(false);
                            setError("")
                        }}
                    >
                        회원가입
                    </button>
                </div>
                <div className="component-form">
                    <h2 className="title-1">{isLogin ? "로그인" : "회원가입"}</h2>
                    <form className="space-y-6" onChange={() => setError("")}>
                        {!isLogin &&
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
                            <label htmlFor="id" className="component-button-info">
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
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            if (isLogin) {
                                                setError("로그인 하는중...");
                                                login();
                                            } else {
                                                setError("회원 가입 하는중...");
                                                register();
                                            }
                                        }
                                    }}
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

                        <div className="flex flex-col items-center space-y-1">
                            <div className='text-red-600 font-bold'>
                                {error}
                            </div>
                            <div
                                className="component-button"
                                onClick={
                                    isLogin ? (
                                        () => {
                                            setError("로그인 하는중...");
                                            login()
                                        }
                                    ) : (
                                        () => {
                                            setError("회원 가입 하는중...");
                                            register()
                                        }
                                    )
                                }
                            >
                                {isLogin ? "로그인" : "회원가입"}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
