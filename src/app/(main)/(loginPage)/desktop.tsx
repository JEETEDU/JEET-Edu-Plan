"use client";

import React, {useState} from "react";
import {cn, getStoreData, POST} from "@/app/(main)/components/functions";
import {useRouter} from "next/navigation";

export default function Desktop() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState({message: "", color: ""});
    const router = useRouter();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [name, setName] = useState("");

    const login = async () => {
        const res = await POST('/api/user/login', {
            login_id: id,
            pw: pw
        })
        if (res.success) {
            await getStoreData('/api/user/info', 'user-info', true);
        } else {
            setError({message: res.message, color: "text-red-600"});
        }
    }

    const register = async () => {
        const res = await POST('/api/user/register', {
            name: name,
            login_id: id,
            pw: pw
        })
        if (res.success) {
            router.refresh();
            setError({message: "아직 선생님이 승인하지 않았습니다.", color: "text-green-600"});
        } else {
            setError({message: res.message, color: "text-red-600"});
        }
    }

    return (
        <div className="component-container h-full flex flex-col justify-center items-center">
            <div className="grid grid-cols-2 component-form mb-4 p-0">
                <button
                    className={cn({
                        "bg-white pointer-events-none": isLogin,
                        "bg-gray-300 hover:bg-gray-200 transition duration-200": !isLogin
                    }, "h-fit rounded-l-lg text-center p-2")}
                    onClick={() => {
                        setIsLogin(true);
                        setError({message: "", color: ""})
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
                        setError({message: "", color: ""})
                    }}
                >
                    회원가입
                </button>
            </div>
            <div className="component-form">
                <h2 className="title-1">
                    {isLogin ? "로그인" : "회원가입"}
                </h2>
                <form className="space-y-6" onChange={() => setError({message: "", color: ""})}>
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="component-button-info">
                                이름:
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="component-input py-2 px-4"
                                placeholder="이름을 입력해 주세요"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="id" className="component-button-info">
                            아이디:
                        </label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="component-input py-2 px-4"
                            placeholder="아이디를 입력해주세요"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    if (isLogin) {
                                        setError({message: "로그인 하는중...", color: "text-red-600"});
                                        login();
                                    } else {
                                        setError({message: "회원 가입 하는중...", color: "text-red-600"});
                                        register();
                                    }
                                }
                            }}
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
                                value={pw}
                                onChange={(e) => setPw(e.target.value)}
                                className="component-input py-2 px-4"
                                placeholder="비밀번호를 입력해주세요"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (isLogin) {
                                            setError({message: "로그인 하는중...", color: "text-red-600"});
                                            login().then(() => router.push('/home'));
                                        } else {
                                            setError({message: "회원 가입 하는중...", color: "text-red-600"});
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

                    <div className="flex flex-col items-center space-y-1">
                        <div className={cn('font-bold', error.color)}>
                            {error.message}
                        </div>
                        <div
                            className="component-button cursor-pointer"
                            onClick={
                                isLogin ? (
                                    () => {
                                        setError({message: "로그인 하는중...", color: "text-red-600"});
                                        login();
                                    }
                                ) : (
                                    () => {
                                        setError({message: "로그인 하는중...", color: "text-red-600"});
                                        register();
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
    );
}
