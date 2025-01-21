'use client';

import {clearSessionStorage, cn, getSessionItem, getStoreData, POST, setSessionItem} from "@/app/(main)/components/functions";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {IsAdmin, IsStudent} from "@/app/(main)/(links)/mypage/(pages)/common";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";
// import {useEffectAsync} from "@/app/(main)/hooks";

export default function Page({isMobile}: { isMobile: boolean }) {
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const router = useRouter();

    const [name, setName] = useState("Loading...");
    const [grade, setGrade] = useState("Loading...");
    const [school, setSchool] = useState("Loading...");
    const [userType, setUserType] = useState(0);

    // const [answered, setAnswered] = useState(false);

    const [qList, setQList] = useState({});

    // const [userList, setUserList] = useState([]);
    // const [newUserList, setNewUserList] = useState([]);

    const [calendarValue, setCalendarValue] = useState(() => {
        const date = getSessionItem('calendar-value');
        if (date) {
            return new Date(date);
        } else {
            return new Date
        }
    });

    // const userInfo = useUserInfo();

    useEffect(() => {
        (async () => {
            setSessionItem('calendar-value', calendarValue.toLocaleDateString());
            // sessionStorage.setItem('calendar-value', calendarValue.toLocaleDateString());

            // const params = `date=${calendarValue.getFullYear()}-${String(calendarValue.getMonth() + 1).padStart(2, '0')}-${String(calendarValue.getDate()).padStart(2, '0')}`
            // console.log(params)

            const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;
            // console.log(userInfo);

            setName(userInfo.name);
            setGrade(`${userInfo.first_year} | ${userInfo.joined_term}`);
            setSchool(userInfo.school);
            setUserType(userInfo.user_type);

            // const today = new Date();
        })();
    }, [calendarValue]);

    const logout = async () => {
        clearSessionStorage();
        const res = await POST("/api/user/logout", {})
        if (res.success) {
            router.push('/');
        } else {
            setError(res.message);
        }
    }

    const [showCalendar, setShowCalendar] = useState(!isMobile);

    const newPassword = async () => {
        const newPw = prompt("새로운 비밀번호를 입력하세요");
        const res = await POST("/api/user/reset_password", {
            new_password: newPw,
        });
        if (res.success) {
            setMessage(`비밀번호가 [${newPw}]로 변경되었습니다.\n새로고침하면 로그아웃되니 다시 로그인하시길 바랍니다.`);
        }
    }

    function Buttons() {
        return (
            <div className="flex flex-row gap-4">
                <button
                    className="px-3 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600 w-fit"
                    onClick={logout}
                >
                    로그아웃
                </button>
                <button
                    className="px-3 py-1 bg-red-500 text-white font-bold rounded hover:bg-red-600 w-fit"
                    onClick={newPassword}
                >
                    비밀번호 변경
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="w-full h-full flex flex-col items-center bg-gray-100">
                <div className="w-full flex flex-row justify-between items-center py-3 px-6">
                    <div className="flex items-center gap-4">
                        {!isMobile && (
                            <button
                                className="p-2 rounded text-lg font-bold bg-gray-500 text-white hover:bg-gray-600"
                                onClick={() => setShowCalendar((prev) => !prev)}
                            >
                                {/*{showCalendar ? "달력 숨기기" : "달력 보이기"}*/}
                                <div className='i-clarity-calendar-line'/>
                            </button>
                        )}
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
                        <div className='text-red-600 font-bold whitespace-break-spaces flex justify-end text-right'>
                            {error}
                        </div>
                        <div className='text-green-600 font-bold whitespace-break-spaces flex justify-end text-right'>
                            {message}
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
                        {!isMobile && <Buttons/>}
                    </div>
                </div>
                {isMobile && (
                    <div className="w-full grid grid-cols-2 justify-center gap-4 px-4 font-bold">
                        <div className="flex justify-center">
                            날짜 선택
                        </div>
                        <button
                            className="flex justify-center border-2 bg-white rounded-lg"
                            onClick={() => setShowCalendar((prev) => !prev)}
                        >
                            {calendarValue.toLocaleDateString()}
                        </button>
                    </div>
                )}
                {(isMobile && showCalendar) && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                        onClick={() => setShowCalendar((prev) => !prev)} // 모달 바깥 클릭 시 닫힘
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
                                <button
                                    className="component-button bg-green-600"
                                    onClick={() => setShowCalendar((prev) => !prev)}
                                >
                                    저장하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <Hr/>
                <div className="flex lg:flex-row flex-col w-full p-6 h-full gap-6">
                    {(!isMobile && showCalendar) && (
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
                        {/*<div className="flex flex-row gap-2">*/}
                        {/*    {(userType >= 2) && (*/}
                        {/*        */}
                        {/*    )}*/}
                        {/*</div>*/}

                        {(userType === 1) && (
                            <IsStudent
                                date={calendarValue}
                                isMobile={isMobile}
                            />
                        )}
                        {(userType >= 2) && (
                            <IsAdmin
                                qList={qList}
                                setQList={setQList}
                                date={calendarValue}
                            />
                        )}
                        {isMobile && <Buttons/>}
                    </div>
                </div>
            </div>
        </>
    )
}