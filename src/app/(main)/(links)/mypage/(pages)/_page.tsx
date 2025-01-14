'use client';

import {clearSessionStorage, cn, getSessionItem, getStoreData, post, setSessionItem} from "@/app/(main)/components/functions";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {IsAdmin, IsStudent} from "@/app/(main)/(links)/mypage/(pages)/common";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Scrollbars from "react-custom-scrollbars-2";

export default function Page({isMobile}) {
    const [error, setError] = useState("");
    const router = useRouter();

    const [name, setName] = useState("Loading...");
    const [grade, setGrade] = useState("Loading...");
    const [school, setSchool] = useState("Loading...");
    const [userType, setUserType] = useState(0);

    const [answered, setAnswered] = useState(false);

    const [qList, setQList] = useState({});
    const [aList, setAList] = useState({});
    const [questionOK, setQuestionOK] = useState(false);
    const [timeData, setTimeData] = useState({wakeup: "", sleep: ""});
    const [userList, setUserList] = useState([]);

    const [calendarValue, setCalendarValue] = useState(() => {
        const date = getSessionItem('calendar-value');
        if (date) {
            return new Date(date);
        } else {
            return new Date
        }
    });

    useEffect(() => {
        (async () => {
            setSessionItem('calendar-value', calendarValue.toLocaleDateString());
            // sessionStorage.setItem('calendar-value', calendarValue.toLocaleDateString());

            const params = `date=${calendarValue.getFullYear()}-${String(calendarValue.getMonth() + 1).padStart(2, '0')}-${String(calendarValue.getDate()).padStart(2, '0')}`
            // console.log(params)

            const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;
            // console.log(userInfo);

            setName(userInfo.name);
            setGrade(userInfo.first_year);
            setSchool(userInfo.school);
            setUserType(userInfo.user_type);

            const today = new Date();

            if (userInfo.user_type === 1) {
                let questions = await getStoreData(`/api/user/today/question?${params}`, `question-list-${params}`)
                if (new Date(questions.last_update).getDate() !== today.getDate()) {
                    questions = await getStoreData(`/api/user/today/question?${params}`, `question-list-${params}`, true)
                }

                if (questions.response.success) {
                    setQuestionOK(true);
                    //----------------------------------------------
                    const _q = Object.values(questions.response.answers[0].questions);
                    const qArr = _q.concat("오늘의 학원 과제는?", "어젯밤 공부한 내용은?", "오늘의 학교 과제는?");
                    const aArr = Object.values(questions.response.answers[0].answers);
                    const qaArr = qArr.map((q, i) => {
                        return [q, aArr[i] || "아직 답하지 않았습니다."];
                    });
                    const qaObj = qaArr.reduce((map, value) => {
                        map[value[0].toString()] = value[1].toString();
                        return map;
                    }, {})
                    //----------------------------------------------
                    setAList(qaObj);
                    setAnswered(Boolean(questions.response.answers[0].answers.answer_1 !== null));
                } else {
                    setQuestionOK(false);
                }

                let times = await getStoreData(`/api/user/today/sleep?${params}`, `sleep-time-${params}`);
                if (new Date(times.last_update).getDate() !== today.getDate()) {
                    times = await getStoreData(`/api/user/today/sleep?${params}`, `sleep-time-${params}`, true);
                }

                setTimeData(times.response.sleep_info[0] || {wakeup: "--:--", sleep: "--:--"});

                // console.log(questions.response.answers[0].answers)
                // console.log(times.response.sleep_info[0])
            } else if (userInfo.user_type >= 2) {
                let questions = await getStoreData(`/api/admin/today/question?${params}`, `question-list-${params}`)
                if (new Date(questions.last_update).getDate() !== today.getDate()) {
                    questions = await getStoreData(`/api/admin/today/question?${params}`, `question-list-${params}`, true)
                }

                if (questions.response.success) {
                    setQuestionOK(true);
                    setQList(questions.response.today_questions);
                    console.log(questions.response.today_questions)
                } else {
                    setQuestionOK(false);
                    setQList({
                        question_1: "",
                        question_2: "",
                        question_3: "",
                    });
                }

                const users = await getStoreData('/api/admin/user/list', 'user-list')
                setUserList(users.response.users)

                // console.log(questions.response.today_questions);
            }
        })()/*.then(r => console.log(r))*/;
    }, [calendarValue]);

    const logout = async () => {
        clearSessionStorage();
        const res = await post("/api/user/logout", {})
        if (res.success) {
            router.push('/');
        } else {
            setError(res.message);
        }
    }

    const [showCalandar, setShowCalandar] = useState(!isMobile);

    const [tab, setTab] = useState(0);
    const tabList = [
        "오늘의 질문",
        "학생 목록"
    ];

    return (
        <>
            <div className='text-red-600 font-bold'>
                {error}
            </div>

            <div className="w-full h-full flex flex-col items-center bg-gray-100">
                <div className="w-full flex flex-row justify-between items-center py-3 px-6">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "font-bold text-gray-800",
                            isMobile ? "text-3xl" : "text-4xl"
                        )}>
                            {name}
                        </div>
                        <div className={cn(
                            "font-bold p-2 rounded-xl",
                            isMobile ? "text-xl" : "text-2xl",
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
                    <div className="flex flex-row gap-8 items-center">
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
                        {!isMobile && (
                            <div
                                className="px-3 py-1 bg-red-500 text-white text-lg font-bold rounded hover:bg-red-600 w-fit"
                                onClick={logout}
                            >
                                로그아웃
                            </div>
                        )}
                    </div>
                </div>
                {isMobile && (
                    <div className="w-full grid grid-cols-2 justify-center gap-4 px-4 font-bold">
                        <div className="flex justify-center">
                            날짜 선택
                        </div>
                        <div
                            className="flex justify-center border-2 bg-white rounded-lg"
                            onClick={() => setShowCalandar((prev) => !prev)}
                        >
                            {calendarValue.toLocaleDateString()}
                        </div>
                    </div>
                )}
                {(isMobile && showCalandar) && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                        onClick={() => setShowCalandar((prev) => !prev)} // 모달 바깥 클릭 시 닫힘
                    >
                        <div
                            className="bg-white rounded-lg shadow-lg p-6 space-y-4 overflow-y-auto w-9/10 h-fit flex flex-col justify-between"
                            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                        >
                            <Calendar
                                locale="ko"
                                value={calendarValue}
                                onChange={setCalendarValue}
                                formatDay={(locale, date): string => {
                                    const day = date.getDate();
                                    return day.toString().padStart(2, '0');
                                }}
                                maxDate={new Date()}
                                minDate={new Date('2025-01-04')} // for test
                                minDetail="year"
                            />

                            <div className="flex flex-col items-center space-y-4">
                                <div
                                    className="component-button bg-green-600"
                                    onClick={() => setShowCalandar((prev) => !prev)}
                                >
                                    저장하기
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex lg:flex-row flex-col w-full p-6 h-full gap-6">
                    {(!isMobile && showCalandar) && (
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
                                minDate={new Date('2025-01-04')} // for test
                                minDetail="year"
                            />
                        </div>
                    )}
                    <div className="w-full h-full flex flex-col">
                        <div className="flex flex-row gap-2">
                            {!isMobile && (
                                <div
                                    className="px-3 py-1 rounded text-lg font-bold bg-gray text-white hover:bg-gray-500"
                                    onClick={() => setShowCalandar((prev) => !prev)}
                                >
                                    {showCalandar ? "달력 숨기기" : "달력 보이기"}
                                </div>
                            )}
                            {(userType >= 2) && (
                                <div className={cn(
                                    "grid text-xl font-bold gap-2 items-center flex-grow",
                                    `grid-cols-${tabList.length}`
                                )}>
                                    {tabList.map((t, i) => {
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex justify-center hover:bg-gray-300 p-1 rounded",
                                                    {"border-2 border-gray": (i === tab)}
                                                )}
                                                onClick={() => setTab(i)}
                                            >
                                                {t}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        <Scrollbars
                            className="w-full h-full"
                            universal
                            autoHide
                        >
                            <div className="flex flex-col w-full h-full items-center p-1">
                                {(userType === 1) && (
                                    <IsStudent
                                        questionOK={questionOK}
                                        aList={aList}
                                        timeData={timeData}
                                        date={calendarValue}
                                        setAList={setAList}
                                        setTimeData={setTimeData}
                                        answered={answered}
                                        isMobile={isMobile}
                                    />
                                )}
                                {(userType >= 2) && (
                                    <IsAdmin
                                        qList={qList}
                                        setQList={setQList}
                                        userList={userList}
                                        date={calendarValue}
                                        tab={tab}
                                        questionOK={questionOK}
                                        setQuestionOK={setQuestionOK}
                                    />
                                )}
                                {isMobile && (
                                    <div
                                        className="m-6 px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 w-fit"
                                        onClick={logout}
                                    >
                                        로그아웃
                                    </div>
                                )}
                            </div>
                        </Scrollbars>
                    </div>
                </div>
            </div>
        </>
    )
}