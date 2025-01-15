'use client';

import {cn, getStoreData, put} from "@/app/(main)/components/functions";
import React, {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import Select from "react-select";

export function TimeInput(
    {
        setState, state, stateKey, className,
        onChange = (() => null),
        selectorPointerEventsNone = false,
    }
) {
    return (
        <div className={className}>
            <div className="flex justify-around items-center h-full w-full">
                <Select
                    className={cn(
                        "text-xl font-bold px-2",
                        {"pointer-events-none": selectorPointerEventsNone}
                    )}
                    placeholder="--"
                    components={{
                        IndicatorSeparator: () => null
                    }}
                    options={Array.from({length: 24}, (_, i) => (
                        {
                            value: String(i + 1).padStart(2, "0"),
                            label: String(i + 1).padStart(2, "0"),
                        }
                    ))}
                    required
                    onChange={(e) => {
                        // setHour(() => e.value);
                        setState((prev) => {
                            const obj = {...prev};
                            obj[stateKey] = `${e.value}:${prev[stateKey].split(':')[1]}`;
                            return obj;
                        });
                        onChange();
                    }}
                    value={{
                        value: state[stateKey].split(':')[0],
                        label: state[stateKey].split(':')[0]
                    }}
                />
                <div className="flex items-start justify-center text-xl">
                    시
                </div>
                <Select
                    className={cn(
                        "text-xl font-bold px-2",
                        {"pointer-events-none": selectorPointerEventsNone}
                    )}
                    placeholder="--"
                    components={{
                        IndicatorSeparator: () => null
                    }}
                    options={Array.from({length: 12}, (_, i) => (
                        {
                            value: String(i * 5).padStart(2, "0"),
                            label: String(i * 5).padStart(2, "0"),
                        }
                    ))}
                    required
                    onChange={(e) => {
                        setState((prev) => {
                            const obj = {...prev};
                            obj[stateKey] = `${prev[stateKey].split(':')[0]}:${e.value}`;
                            return obj;
                        });
                        onChange();
                    }}
                    value={{
                        value: state[stateKey].split(':')[1],
                        label: state[stateKey].split(':')[1]
                    }}
                />
                <div className="flex items-start justify-center text-xl">
                    분
                </div>
            </div>
        </div>
    );
}

export function TodayQuestion({device}: { device }) {
    const path = usePathname();
    const [answered, setAnswered] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const [questionOK, setQuestionOK] = useState(false);
    const [userType, setUserType] = useState(0);

    const [qList, setQList] = useState({})

    const [timeData, setTimeData] = useState({
        "wakeup_time": "07:00",
        "sleep_time": "23:00"
    });

    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;
            setUserType(userInfo.user_type)

            if (userInfo.user_type === 1) {
                const today = new Date();

                let questions = await getStoreData(`/api/user/today/question`, 'question-list')
                if (new Date(questions.last_update).getDate() !== today.getDate()) {
                    questions = await getStoreData(`/api/user/today/question`, 'question-list', true)
                }

                if (questions.response.success) {
                    setQuestionOK(true);
                    setQList(questions.response.answers[0].questions);
                    setAnswered((questions.response.answers[0].answers.answer_1 !== null));
                } else {
                    setQuestionOK(false);
                }
            }

        })()/*.then(r => console.log(r))*/;
    }, [answered]);

    const register = async () => {
        // console.log(timeData)
        const body = {
            answer_lastday: document.getElementById('y').value,
            answer_school: document.getElementById('s').value,
            answer_academy: document.getElementById('a').value
        };

        Object.entries(qList).map(([key, value], index) => {
            if (value !== null) {
                body[`answer_${index + 1}`] = document.getElementById(key).value;
            }
        });

        const r1 = await put('/api/user/today/sleep', timeData)
        // console.log(r1)
        if (!r1.success) {
            // alert("error occurred while put sleep / wakeup time");
            return false;
        }

        const r2 = await put('/api/user/today/question', body)
        // console.log(r2)
        if (r2.success) {
            const today = new Date();
            const param = `date=${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
            await getStoreData(`/api/user/today/question?${param}`, 'question-list', true)

            window.location.reload();
        } else {
            // alert('error occurred while put answer for daily questions');
            return false;
        }

        if (r1 && r2) {
            alert('제출되었습니다!');
            sessionStorage.clear();
            return true;
        }
    }

    return (<>
        {/*  */}
        {(!answered && userType === 1 && questionOK) && (
            <div className="fixed inset-0 flex items-end justify-end z-50 pointer-events-none">
                <div
                    className={cn(
                        "p-3 rounded-2xl bg-blue-400 shadow-2xl hover:bg-blue-500 border border-blueGray pointer-events-auto",
                        (device === 'desktop') ?
                            "m-8 text-xl" :
                            cn("mr-3", (path === '/home') ? "mb-25" : "mb-15")
                    )}
                    onClick={() => {
                        setShowQuestion(!showQuestion);
                        // console.log(userType)
                        // console.log(qList)
                    }}
                >
                    오늘의 질문 답하기
                </div>
            </div>
        )}
        {showQuestion && (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                onClick={() => setShowQuestion(!showQuestion)} // 모달 바깥 클릭 시 닫힘
            >
                <div
                    className="bg-white rounded-lg shadow-lg p-6 space-y-4 overflow-y-auto w-9/10 h-9/10 flex flex-col justify-between"
                    onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                >
                    <div className="flex flex-col gap-15 sm:flex-row justify-center items-center border p-6">
                        {/* 어제 밤에 잠든 시간 */}
                        <div className="flex flex-col items-center gap-3">
                            <label
                                htmlFor="sleep_time"
                                className="text-lg font-medium text-gray-700"
                            >
                                어제 밤에 잠든 시간은?
                            </label>
                            <TimeInput
                                className="w-full"
                                setState={setTimeData}
                                state={timeData}
                                stateKey={"sleep_time"}
                                onChange={() => setError("")}
                            />
                        </div>

                        {/* 오늘 아침 일어난 시간 */}
                        <div className="flex flex-col items-center gap-3">
                            <label
                                htmlFor="wakeup_time"
                                className="text-lg font-medium text-gray-700"
                            >
                                오늘 아침 일어난 시간은?
                            </label>
                            <TimeInput
                                className="w-full"
                                setState={setTimeData}
                                state={timeData}
                                stateKey={"wakeup_time"}
                                onChange={() => setError("")}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(qList).map(([key, value]) => {
                            if (value !== null) {
                                return (
                                    // eslint-disable-next-line react/jsx-key
                                    <div key={key}>
                                        <label htmlFor="name" className="component-button-info">
                                            {value.toString()}
                                        </label>
                                        <TextareaAutosize
                                            id={key}
                                            className="component-input resize-none"
                                            placeholder={"몰라요"}
                                            required
                                            onChange={() => setError("")}
                                        />
                                    </div>
                                );
                            }
                        })}

                        <div>
                            <label htmlFor="name" className="component-button-info">
                                오늘의 학원 과제는?
                            </label>
                            <TextareaAutosize
                                id="a"
                                className="component-input resize-none"
                                placeholder={"몰라요"}
                                required
                                onChange={() => setError("")}
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="component-button-info">
                                어젯밤 공부한 내용은?
                            </label>
                            <TextareaAutosize
                                id="y"
                                className="component-input resize-none"
                                placeholder={"몰라요"}
                                required
                                onChange={() => setError("")}
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="component-button-info">
                                오늘의 학교 과제는?
                            </label>
                            <TextareaAutosize
                                id="s"
                                className="component-input resize-none"
                                placeholder={"몰라요"}
                                required
                                onChange={() => setError("")}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-red-600 font-bold">
                            {error}
                        </div>
                        <div
                            className="component-button"
                            onClick={() => {
                                register().then(r => {
                                    if (r) {
                                        setAnswered(!answered);
                                        setShowQuestion(!showQuestion);
                                    } else {
                                        setError("정확한 정보를 입력해 주세요");
                                    }
                                    // console.log(r);
                                    // console.log(answered)
                                });
                            }}
                        >
                            제출하기
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>);
}