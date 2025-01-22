'use client';

import React, {useEffect, useState} from "react";
import {GET, POST} from "@/app/(main)/components/functions";

interface IUser {
    uid: number;
    login_id: string;
    user_type: number;
    name: string;
    first_year: number;
    school: string;
    joined_term: string;
    classes: {
        id: number;
        name: string;
    }[];
}

export default function UserClass({uid, userType}: { uid: number; userType: number; }) {
    const [message, setMessage] = useState<[string, string]>(["1", "2"]);
    const [error, setError] = useState<string>("test");
    const [user, setUser] = useState<IUser>({
        classes: [],
        first_year: 0,
        joined_term: "",
        login_id: "",
        name: "",
        school: "",
        uid: uid,
        user_type: 1
    });

    function getClassList() {
        (async () => {
            const res: {
                success: boolean;
                users: IUser[];
            } = await GET(`/api/admin/user?search_by=user_id&search_string=${uid}`);
            console.log("?", res);
            if (res.success) {
                setUser(res.users[0]);
            }
        })();
    }

    useEffect(() => {
        console.log(uid)
        setMessage(["", ""]);
        setError("");
        getClassList();
    }, [uid])


    return (
        <div className="flex flex-col justify-between items-center space-y-4">
            <div className="flex items-center w-full justify-between">
                <div className="text-2xl text-gray-800 font-semibold">
                    반 설정
                </div>
                <div className="flex items-center text-lg text-red-700 font-bold">
                    {error}
                </div>
            </div>
            <div className="flex flex-col w-full gap-2 items-end justify-between">
                {user.classes.map((c) => (
                    <div
                        key={c.id}
                        className="border-2 rounded flex w-full justify-between p-2 cursor-pointer hover:bg-white"
                    >
                        <div className="flex items-center gap-4">
                            <div>
                                <div className="text-xl font-bold">
                                    {c.name as string}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                const res = confirm(`${c.name} 반에서 학생을 제외하시겠습니까?`);
                                if (res) {
                                    if (user.user_type === 1) {
                                        POST('/api/admin/class/quit/student', {
                                            class_id: c.id,
                                            user_id: uid
                                        }).then(getClassList);
                                    } else {
                                        POST('/api/admin/class/quit/teacher', {
                                            class_id: c.id,
                                            user_id: uid
                                        }).then(getClassList);
                                    }
                                }
                            }}
                            className="p-1 border-2 border-red rounded hover:bg-red hover:text-white duration-200"
                        >
                            <div className="i-system-uicons-exit-right"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}