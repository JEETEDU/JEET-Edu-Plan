'use client';

import {cn, getStoreData, post} from "@/app/(main)/components/functions";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {IsAdmin, IsStudent} from "@/app/(main)/(links)/mypage/(pages)/common";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Scrollbars from "react-custom-scrollbars-2";

export default function Desktop() {
    const [error, setError] = useState("");
    const router = useRouter();

    const [name, setName] = useState("Loading...");
    const [grade, setGrade] = useState("Loading...");
    const [school, setSchool] = useState("Loading...");
    const [userType, setUserType] = useState(0);

    const [answered, setAnswered] = useState(false);

    const [qList, setQList] = useState({})
    const [aList, setAList] = useState({});
    const [timeData, setTimeData] = useState({wakeup: "", sleep: ""});
    const [userList, setUserList] = useState([]);

    const [calendarValue, setCalendarValue] = useState(() => {
        const date = sessionStorage.getItem('calendar-value');
        if (date) {
            return new Date(date);
        } else {
            return new Date
        }
    });

    useEffect(() => {
        (async () => {
            sessionStorage.setItem('calendar-value', calendarValue.toLocaleDateString());

            const params = `date=${calendarValue.getFullYear()}-${String(calendarValue.getMonth() + 1).padStart(2, '0')}-${String(calendarValue.getDate()).padStart(2, '0')}`
            // console.log(params)

            const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;
            // console.log(userInfo);

            setName(userInfo.name);
            setGrade(userInfo.first_year);
            setSchool(userInfo.school);
            setUserType(userInfo.user_type);

            if (userInfo.user_type === 1) {
                const today = new Date();

                let questions = await getStoreData(`/api/user/today/question?${params}`, `question-list-${params}`)
                if (new Date(questions.last_update).getDate() !== today.getDate()) {
                    questions = await getStoreData(`/api/user/today/question?${params}`, `question-list-${params}`, true)
                }

                //----------------------------------------------questions.response.answers[0].answers
                const _q = Object.values(questions.response.answers[0].questions);
                const qArr = _q.concat("오늘의 학원 과제는?", "어젯밤 공부한 내용은?", "오늘의 학교 과제는?");
                const aArr = Object.values(questions.response.answers[0].answers);
                const qaArr = qArr.map((q, i) => {
                    return [q, aArr[i] || "아직 답하지 않았습니다."]
                });
                const qaObj = qaArr.reduce((map, value) => {
                    map[value[0].toString()] = value[1].toString();
                    return map;
                }, {})
                //----------------------------------------------
                setAList(qaObj);
                setAnswered(Boolean(questions.response.answers[0].answers.answer_1 !== null))

                let times = await getStoreData(`/api/user/today/sleep?${params}`, `sleep-time-${params}`);
                if (new Date(times.last_update).getDate() !== today.getDate()) {
                    times = await getStoreData(`/api/user/today/sleep?${params}`, `sleep-time-${params}`, true);
                }

                setTimeData(times.response.sleep_info[0] || {wakeup: "--:--", sleep: "--:--"});

                // console.log(questions.response.answers[0].answers)
                // console.log(times.response.sleep_info[0])
            } else if (userInfo.user_type >= 2) {
                const today = new Date();

                let questions = await getStoreData(`/api/admin/today/question?${params}`, `question-list-${params}`)
                if (new Date(questions.last_update).getDate() !== today.getDate()) {
                    questions = await getStoreData(`/api/admin/today/question?${params}`, `question-list-${params}`, true)
                }

                setQList(questions.response.today_questions);

                const users = await getStoreData('/api/admin/user/list', 'user-list')
                setUserList(users.response.users)

                // console.log(questions.response.today_questions);
            }
        })()/*.then(r => console.log(r))*/;
    }, [calendarValue]);

    const logout = async () => {
        sessionStorage.clear();
        const res = await post("/api/user/logout", {})
        if (res.success) {
            router.push('/');
        } else {
            setError(res.message);
        }
    }

    const [showCalandar, setShowCalandar] = useState(true);

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
                    <div
                        className="p-1 rounded-xl text-lg font-bold bg-gray text-white hover:bg-gray-500"
                        onClick={() => setShowCalandar((prev) => !prev)}
                    >
                        {showCalandar ? "달력 숨기기" : "달력 보이기"}
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
                <div className="flex lg:flex-row flex-col w-full p-6 h-full gap-6">
                    {showCalandar && (
                        <div className="flex flex-row lg:flex-col gap-2">
                            <div className="grow border-2 border-gray-500 text-center p-2 flex items-center justify-center">
                                여기도 뭔가 넣어싶어요<br/><br/>
                                오늘의 전반적인 요약 같은걸 넣으면 어떨까
                            </div>
                            <Calendar
                                locale="ko"
                                value={calendarValue}
                                onChange={setCalendarValue}
                                formatDay={(locale, date): string => {
                                    const day = date.getDate();
                                    return day.toString().padStart(2, '0');
                                }}
                                maxDate={new Date()}
                                minDetail="year"
                            />
                        </div>
                    )}
                    <Scrollbars
                        className="w-full h-full"
                        universal
                        autoHide
                    >
                        <div className="flex flex-col w-full h-full items-center p-1">
                            {(userType === 1) && (
                                <IsStudent
                                    aList={aList}
                                    timeData={timeData}
                                    date={calendarValue}
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
                                    date={calendarValue}
                                />
                            )}
                            <div
                                className="m-6 px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 w-fit"
                                onClick={logout}
                            >
                                로그아웃
                            </div>
                        </div>
                    </Scrollbars>
                </div>
            </div>
        </>
    )
}