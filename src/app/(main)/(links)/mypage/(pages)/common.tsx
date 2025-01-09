"use client";

import TextareaAutosize from "react-textarea-autosize";
import React, {useState} from "react";
import {cn, getStoreData, put} from "@/app/(main)/components/functions";
import {TimeInput} from "@/app/(main)/components/common";

export function IsStudent({timeData, setTimeData, aList, setAList, answered, date, isMobile}) {
    const [editAnswer, setEditAnswer] = useState(false);
    const [error, setError] = useState("");

    const _a = [
        "answer_1",
        "answer_2",
        "answer_3",
        "answer_lastday",
        "answer_school",
        "answer_academy",
    ]

    const today = new Date();
    const params = `date=${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // console.log(timeData);

    const update = async () => {
        if (editAnswer) {
            setError("저장중...");

            const body = Object.entries(aList).reduce((obj, val, idx) => {
                obj[_a[idx]] = val[1];
                return obj;
            }, {});
            // console.log(body)

            await put('/api/user/today/question', body);

            const questions = await getStoreData(`/api/user/today/question?${params}`, `question-list-${params}`, true);

            //---
            const _q = Object.values(questions.response.answers[0].questions);
            const qArr = _q.concat("오늘의 학원 과제는?", "어젯밤 공부한 내용은?", "오늘의 학교 과제는?");
            const aArr = Object.values(questions.response.answers[0].answers);
            const qaArr = qArr.map((q, i) => {
                return [q, aArr[i]]
            });
            const qaObj = qaArr.reduce((map, value) => {
                map[value[0].toString()] = value[1].toString();
                return map;
            }, {})
            //---
            setAList(qaObj);

            await put('/api/user/today/sleep', {
                sleep_time: timeData.sleep,
                wakeup_time: timeData.wakeup,
            }).then(r => {
                // console.log(r);
                // console.log(timeData);
            });

            const times = await getStoreData(`/api/user/today/sleep?${params}`, `sleep-time-${params}`, true);
            setTimeData(times.response.sleep_info[0]);

            setError("");
        }
        setEditAnswer(!editAnswer)
    }

    return (
        <div className={cn(
            "w-full space-y-4",
            {"p-6": !isMobile}
        )}>
            <div className="flex items-center w-full justify-between">
                <div className={cn(
                    "text-gray-800 font-semibold",
                    isMobile ? "text-2xl" : "text-3xl"
                )}>
                    오늘의 질문 목록 {!isMobile && `(${date.toLocaleDateString()})`}
                </div>
                {(answered && today.getDate() === date.getDate()) && (
                    <div className="flex items-center gap-4">
                        <div className="font-bold text-red-600 items-center">
                            {error}
                        </div>
                        <div
                            className={cn(
                                "text-white rounded-lg font-semibold p-1",
                                {"bg-blue hover:bg-blue-700": !editAnswer},
                                {"bg-blue-700 hover:bg-blue": editAnswer},
                                {"text-lg": !isMobile}
                            )}
                            onClick={update}
                        >
                            {(editAnswer) ? "응답 저장하기" : "응답 수정하기"}
                        </div>
                    </div>
                )}
            </div>
            <div className={cn(
                "grid w-full gap-4",
                isMobile ? "grid-rows-2" : "grid-cols-2"
            )}>
                <div className={cn(
                    "items-center justify-center flex",
                    {"flex-col": !isMobile}
                )}>
                    <div className="text-xl font-semibold">
                        취침 시간
                    </div>
                    <TimeInput
                        className="w-fit p-1"
                        setState={setTimeData}
                        state={timeData}
                        stateKey={"sleep"}
                        // onChange={() => setError("")}
                        selectorPointerEventsNone={!editAnswer}
                    />
                </div>
                <div className={cn(
                    "items-center justify-center flex",
                    {"flex-col": !isMobile}
                )}>
                    <div className="text-xl font-semibold">
                        기상 시간
                    </div>
                    <TimeInput
                        className="w-fit p-1"
                        setState={setTimeData}
                        state={timeData}
                        stateKey={"wakeup"}
                        // onChange={() => setError("")}
                        selectorPointerEventsNone={!editAnswer}
                    />
                </div>
            </div>
            <div className="w-full space-y-4">
                {Object.entries(aList).map(([q, a], i) => {
                    return <div key={i}>
                        <div key={i}>
                            <label htmlFor="name" className="component-button-info">
                                {q}
                            </label>
                            <TextareaAutosize
                                readOnly={!editAnswer}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': editAnswer}
                                )}
                                cacheMeasurements
                                value={a as string}
                                onChange={(e) => {
                                    setAList((prev) => {
                                        const _obj = {...prev};
                                        _obj[q] = e.target.value;
                                        return _obj;
                                    });
                                }}
                            />
                        </div>
                    </div>
                })}
            </div>
        </div>
    );
}

export function IsAdmin({qList, setQList, userList, date, tab}) {
    const [editQuestion, setEditQuestion] = useState(false);
    const today = new Date();
    const params = `date=${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const update = async () => {
        if (editQuestion) {

            await put('/api/admin/today/question', {
                question_1: qList.question_1,
                question_2: qList.question_2,
                question_3: qList.question_3
            });

            const questions = await getStoreData(`/api/admin/today/question?${params}`, `question-list-${params}`, true);
            setQList(questions.response.today_questions);
        }
        setEditQuestion(!editQuestion)
    }

    return (
        <div className="w-full p-6 space-y-8">
            {(tab === 0) && (
                <>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-3xl text-gray-800 font-semibold">
                            오늘의 질문 목록 ({date.toLocaleDateString()})
                        </div>
                        {(today.getDate() === date.getDate()) && (
                            <div
                                className={cn(
                                    "text-lg text-white rounded-lg font-semibold p-1",
                                    {"bg-blue hover:bg-blue-700": !editQuestion},
                                    {"bg-blue-700 hover:bg-blue": editQuestion}
                                )}
                                onClick={update}
                            >
                                {(editQuestion) ? "저장하기" : "수정하기"}
                            </div>
                        )}
                    </div>
                    <div className="w-full space-y-4">
                        {Object.entries({
                            "answer_lastday": "어젯밤 공부한 내용은?",
                            "answer_school": "오늘의 학교 과제는?",
                            "answer_academy": "오늘의 학원 과제는?"
                        }).map(([key, qString]) => {
                            return (
                                // eslint-disable-next-line react/jsx-key
                                <TextareaAutosize
                                    key={key}
                                    readOnly
                                    className={cn(
                                        "component-input resize-none",
                                        // {'bg-white': editQuestion}
                                    )}
                                    value={qString.toString()}
                                />
                            );
                        })}
                        {Object.entries(qList).map(([key, q]) => {
                            if (key !== "date") {
                                return (
                                    <TextareaAutosize
                                        key={key}
                                        readOnly={!editQuestion}
                                        className={cn(
                                            "component-input resize-none",
                                            {'bg-white': editQuestion}
                                        )}
                                        value={q as string}
                                        onChange={(e) => {
                                            setQList((prev) => {
                                                const obj = {...prev};
                                                obj[key] = e.target.value;
                                                return obj;
                                            });
                                        }}
                                    />
                                );
                            } else {
                            }
                        })}
                    </div>
                </>
            )}
            {(tab === 1) && (
                <>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-3xl text-gray-800 font-semibold">
                            학생 목록
                        </div>
                    </div>
                    <div className="w-full space-y-4">
                        {userList.map((u) => {
                            return (
                                <div key={u.uid}>
                                    {JSON.stringify(u)}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    );
}