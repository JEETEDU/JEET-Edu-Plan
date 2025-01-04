'use client';

import {cn, getStoreData, post} from "@/app/(main)/components/functions";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";

export default function Desktop() {
    const [error, setError] = useState("");
    const router = useRouter();

    const [name, setName] = useState("Loading...");
    const [grade, setGrade] = useState("Loading...");
    const [school, setSchool] = useState("Loading...");
    const [userType, setUserType] = useState(0);

    const [qList, setQList] = useState({})
    const [aList, setAList] = useState({})
    const [timeData, setTimeData] = useState({wakeup: "", sleep: ""});

    useEffect(() => {
        (async () => {
            const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;
            console.log(userInfo);

            setName(userInfo.name);
            setGrade(userInfo.first_year);
            setSchool(userInfo.school);
            setUserType(userInfo.user_type);

            if (userInfo.user_type === 1) {
                const today = new Date();
                const param = `date=${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`

                let questions = await getStoreData(`/api/user/today/question?${param}`, 'question-list')
                if (new Date(questions.last_update).getDate() !== today.getDate()) {
                    questions = await getStoreData(`/api/user/today/question?${param}`, 'question-list', true)
                }

                setQList(questions.response.answers[0].questions);
                setAList(questions.response.answers[0].answers);

                let times = await getStoreData(`/api/user/today/sleep?${param}`, 'sleep-time');
                if (new Date(times.last_update).getDate() !== today.getDate()) {
                    times = await getStoreData(`/api/user/today/sleep?${param}`, 'sleep-time', true);
                }

                setTimeData(times.response.sleep_info[0]);

                console.log(questions.response.answers[0].answers)
                console.log(times.response.sleep_info[0])
            }
        })().then(r => console.log(r));
    }, []);

    const logout = async () => {
        sessionStorage.clear();
        const res = await post("/api/user/logout", {})
        if (res.success) {
            router.push('/');
        } else {
            setError(res.message);
        }
    }

    return (
        <>
            <div className='text-red-600 font-bold'>
                {error}
            </div>

            <div className="w-full h-full flex flex-col items-center bg-gray-100">
                <div className="w-full flex flex-row justify-between items-center py-3 px-6">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-gray-800">
                            {name}
                        </div>
                        <div className={cn(
                            "text-2xl font-bold p-2 rounded-xl",
                            {
                                "bg-green": (userType === 1),
                                "text-white bg-blue": (userType === 2),
                                "bg-red": (userType === 3),
                            }
                        )}>
                            {
                                ["학생", "선생님", "관리자"][userType - 1]
                            }
                        </div>
                    </div>
                    {(userType === 1) && (
                        <div className="w-fit flex flex-col items-end">
                            <div className="text-left text-xl font-bold text-gray-800">
                                {grade}
                            </div>
                            <div className="text-left text-l font-bold text-gray-600">
                                {school}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col overflow-y-auto w-full h-full items-center">
                    <div className="w-full p-6 space-y-4">
                        <div className="text-2xl text-gray-800 font-semibold">
                            오늘의 질문
                        </div>
                        <div className="grid grid-cols-2 w-full">
                            <div className="items-center justify-center flex flex-col">
                                <div className="text-xl font-semibold">
                                    취침 시간
                                </div>
                                <div className="text-xl font-semibold">
                                    {timeData.wakeup}
                                </div>
                            </div>
                            <div className="items-center justify-center flex flex-col">
                                <div className="text-xl font-semibold">
                                    기상 시간
                                </div>
                                <div className="text-xl font-semibold">
                                    {timeData.sleep}
                                </div>
                            </div>
                        </div>
                        <div className="w-full space-y-4">
                            {Object.entries({
                                "answer_lastday": "어젯밤 공부한 내용은?",
                                "answer_school": "오늘의 학교 과제는?",
                                "answer_academy": "오늘의 학원 과제는?"
                            }).map(([key, qString]) => {
                                return (
                                    // eslint-disable-next-line react/jsx-key
                                    <div key={key}>
                                        <label htmlFor="name" className="component-button-info">
                                            {qString}
                                        </label>
                                        <div className="component-input">
                                            {aList[key] || "아직 답하지 않았습니다."}
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.entries(qList).map(([key, value], index) => {
                                return (
                                    // eslint-disable-next-line react/jsx-key
                                    <div key={key}>
                                        <label htmlFor="name" className="component-button-info">
                                            {value}
                                        </label>
                                        <TextareaAutosize
                                            readOnly
                                            className="component-input resize-none"
                                            value={aList[`answer_${index + 1}`] || "아직 답하지 않았습니다."}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div
                        className="m-6 px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 w-fit"
                        onClick={logout}
                    >
                        로그아웃
                    </div>
                </div>
            </div>
        </>
    )
}