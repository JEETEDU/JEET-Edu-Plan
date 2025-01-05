'use client';

import {cn, getStoreData, post, put, get} from "@/app/(main)/components/functions";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import {IsAdmin, IsStudent} from "@/app/(main)/(links)/mypage/(pages)/common";

export default function Desktop() {
    const [error, setError] = useState("");
    const router = useRouter();

    const [name, setName] = useState("Loading...");
    const [grade, setGrade] = useState("Loading...");
    const [school, setSchool] = useState("Loading...");
    const [userType, setUserType] = useState(0);

    const [answered, setAnswered] = useState(false);

    const [qList, setQList] = useState({})
    const [aList, setAList] = useState({})
    const [timeData, setTimeData] = useState({wakeup: "", sleep: ""});
    const [userList, setUserList] = useState([]);

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

                let questions = await getStoreData(`/api/user/today/question`, 'question-list')
                if (new Date(questions.last_update).getDate() !== today.getDate()) {
                    questions = await getStoreData(`/api/user/today/question`, 'question-list', true)
                }

                setQList(questions.response.answers[0].questions);
                setAList(questions.response.answers[0].answers);
                setAnswered((questions.response.answers[0].answers.answer_1 !== null))

                let times = await getStoreData(`/api/user/today/sleep`, 'sleep-time');
                if (new Date(times.last_update).getDate() !== today.getDate()) {
                    times = await getStoreData(`/api/user/today/sleep`, 'sleep-time', true);
                }

                setTimeData(times.response.sleep_info[0] || {wakeup: "--:--", sleep: "--:--"});

                console.log(questions.response.answers[0].answers)
                console.log(times.response.sleep_info[0])
            } else if (userInfo.user_type >= 2) {
                const today = new Date();

                let questions = await getStoreData(`/api/admin/today/question`, 'question-list')
                if (new Date(questions.last_update).getDate() !== today.getDate()) {
                    questions = await getStoreData(`/api/admin/today/question`, 'question-list', true)
                }

                setQList(questions.response.today_questions);

                const users = await getStoreData('/api/admin/user/list', 'user-list')
                setUserList(users.response.users)

                console.log(questions.response.today_questions);
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
                    {(userType === 1) && (
                        <IsStudent
                            qList={qList}
                            aList={aList}
                            timeData={timeData}
                            setAList={setAList}
                            setTimeData={setTimeData}
                            answered={answered}
                        />
                    )}
                    {(userType >= 2) && (
                        <IsAdmin
                            qList={qList}
                            setQList={setQList}
                            userList={userList}
                        />
                    )}
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