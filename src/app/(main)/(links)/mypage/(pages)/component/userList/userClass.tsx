'use client';

import React, {useEffect, useState} from "react";


export default function UserClass({uid, userType}: { uid: number; userType: number },) {
    const [message, setMessage] = useState<[string, string]>(["1", "2"]);
    const [error, setError] = useState<string>("test");

    useEffect(() => {
        setMessage(["", ""]);
        setError("");
    }, [uid])


    return (
        <div className="flex flex-col justify-between items-center">
            <div className="flex items-center w-full justify-between">
                <div className="text-2xl text-gray-800 font-semibold">
                    반 설정
                </div>
                <div className="flex items-center text-lg text-red-700 font-bold">
                    {error}
                </div>
            </div>
            {/*<div className="flex flex-col w-full gap-4 items-end justify-between">*/}
            {/*    <div className="flex items-center w-full justify-end gap-4">*/}
            {/*        <div className="flex items-center text-lg text-green-700 font-bold whitespace-break-spaces text-right">*/}
            {/*            {message[0]}*/}
            {/*        </div>*/}
            {/*        <button*/}
            {/*            className="px-3 py-1 bg-blue-500 text-white text-md font-bold rounded hover:bg-blue-600"*/}
            {/*            onClick={resetPassword}*/}
            {/*        >*/}
            {/*            비밀번호 리셋*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*    <div className="flex items-center w-full justify-end gap-4">*/}
            {/*        <div className="flex items-center text-lg text-green-700 font-bold">*/}
            {/*            {message[1]}*/}
            {/*        </div>*/}
            {/*        <button*/}
            {/*            className="px-3 py-1 bg-red-500 text-white text-md font-bold rounded hover:bg-red-600"*/}
            {/*            onClick={deleteUser}*/}
            {/*        >*/}
            {/*            유저 삭제*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
}