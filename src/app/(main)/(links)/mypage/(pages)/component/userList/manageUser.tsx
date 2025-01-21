'use client';

import React, {useEffect, useState} from "react";
import {DELETE, POST} from "@/app/(main)/components/functions";

export interface CManageUser {
    uid: number
}

export default function ManageUser(
    {
        uid
    }: CManageUser,
) {
    const [message, setMessage] = useState<[string, string]>(["", ""]);
    const [error, setError] = useState<string>("test");

    useEffect(() => {
        setMessage(["", ""]);
        setError("");
    }, [uid])

    const resetPassword = () => {
        POST("/api/admin/user/reset_password", {
            user_id: uid
        }).then((res) => {
            if (res.success) {
                setMessage((prev) => [
                        `새로운 비밀번호는 ${res.message.split(':')[1]} 입니다.\n(복사하세요)`,
                        prev[1]
                    ]
                );
            } else {
                setError("오류가 발생하였습니다.");
            }
        });
    }

    const deleteUser = () => {
        DELETE("/api/admin/user", {
            user_id: uid
        }).then((res) => {
            if (res.success) {
                setMessage((prev) => [
                        prev[0],
                        "유저가 삭제되었습니다. (다른 유저를 선택하세요)"
                    ]
                );
            } else {
                setError("오류가 발생하였습니다.");
            }
        });
    }

    return (
        <div className="flex flex-col justify-between items-center">
            <div className="flex items-center w-full justify-between">
                <div className="text-2xl text-gray-800 font-semibold">
                    유저 관리
                </div>
                <div className="flex items-center text-lg text-red-700 font-bold">
                    {error}
                </div>
            </div>
            <div className="flex flex-col w-full gap-4 items-end justify-between">
                <div className="flex items-center w-full justify-end gap-4">
                    <div className="flex items-center text-lg text-green-700 font-bold whitespace-break-spaces text-right">
                        {message[0]}
                    </div>
                    <button
                        className="px-3 py-1 bg-blue-500 text-white text-md font-bold rounded hover:bg-blue-600"
                        onClick={resetPassword}
                    >
                        비밀번호 리셋
                    </button>
                </div>
                <div className="flex items-center w-full justify-end gap-4">
                    <div className="flex items-center text-lg text-green-700 font-bold">
                        {message[1]}
                    </div>
                    <button
                        className="px-3 py-1 bg-red-500 text-white text-md font-bold rounded hover:bg-red-600"
                        onClick={deleteUser}
                    >
                        유저 삭제
                    </button>
                </div>
            </div>
        </div>
    );
}