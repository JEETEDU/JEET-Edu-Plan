"use client";

import React, {useState} from "react";
import {cn, getStoreData, POST} from "@/app/(main)/components/functions";
import {useRouter} from "next/navigation";
import Privacy from "@/app/(main)/components/privacy";
import Scrollbars from "react-custom-scrollbars-2";

export default function Desktop() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState({message: "", color: ""});
    const router = useRouter();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [name, setName] = useState("");
    const [privacy, setPrivacy] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

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
                        "bg-gray-300 md:hover:bg-gray-200 transition ": !isLogin
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
                        "bg-gray-300 md:hover:bg-gray-200 transition ": isLogin
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
                                        login().then(() => router.push('/home'));
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
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <div className={showPassword ? "i-system-uicons-eye" : "i-system-uicons-eye-closed"}/>
                                {/* 비밀번호 보기 아이콘 */}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="flex flex-row gap-2 items-center">
                            <div className="text-xl">
                                <div
                                    className={
                                        privacy ? "i-system-uicons:checkbox-checked" : "i-system-uicons:checkbox-empty"
                                    }
                                    onClick={() => setPrivacy(!privacy)}
                                />
                            </div>
                            <div>
                                <span
                                    className="text-blue-600 font-bold md:hover:text-blue-700 cursor-pointer"
                                    onClick={() => setShowPrivacy(true)}
                                >
                                    개인정보 처리방침(보기)
                                </span>
                                에 동의합니다.
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center space-y-1">
                        <div className={cn('font-bold', error.color)}>
                            {error.message}
                        </div>
                        <div
                            className={cn(
                                "w-full component-button",
                                (isLogin || privacy) ? "" : " bg-gray-400 pointer-events-none"
                            )}
                            onClick={
                                isLogin ? (
                                    () => {
                                        setError({message: "로그인 하는중...", color: "text-red-600"});
                                        login().then(() => router.push('/home'));
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
            {showPrivacy && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                    onClick={() => setShowPrivacy(false)} // 모달 바깥 클릭 시 닫힘
                >
                    <div
                        className="bg-white rounded-lg shadow-lg space-y-4 overflow-y-auto w-9/10 h-9/10 flex flex-col justify-between"
                        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                    >
                        <Scrollbars
                            className="w-full flex-1 h-full"
                            universal
                            autoHide
                        >
                            <div className="p-4">
                                <Privacy/>
                            </div>
                        </Scrollbars>
                        <div className="w-full flex items-center justify-center px-4 pb-4">
                            <button
                                className="component-button bg-gray-400 md:hover:bg-gray-600 w-full"
                                onClick={() => setShowPrivacy(false)}
                            >
                                취소 (닫기)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
