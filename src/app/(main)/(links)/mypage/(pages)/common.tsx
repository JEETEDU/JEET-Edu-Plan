"use client";

import TextareaAutosize from "react-textarea-autosize";
import React, {useState} from "react";
import {cn, getStoreData, put} from "@/app/(main)/components/functions";
import {TimeInput} from "@/app/(main)/components/common";

export function IsStudent({timeData, setTimeData, aList, setAList, qList, answered}) {
    const [editAnswer, setEditAnswer] = useState(false);
    const [error, setError] = useState("");

    console.log(timeData);

    return (
        <div className="w-full p-6 space-y-4">
            <div className="flex items-center w-full justify-between">
                <div className="text-2xl text-gray-800 font-semibold">
                    오늘의 질문 목록
                </div>
                {answered && (
                    <div className="flex items-center gap-4">
                        <div className="font-bold text-red-600 items-center">
                            {error}
                        </div>
                        <div
                            className={cn(
                                "text-lg text-white rounded-lg font-semibold p-1",
                                {"bg-blue hover:bg-blue-700": !editAnswer},
                                {"bg-blue-700 hover:bg-blue": editAnswer}
                            )}
                            onClick={async () => {
                                if (editAnswer) {
                                    setError("저장중...");

                                    await put('/api/user/today/question', {
                                        answer_1: aList.answer_1,
                                        answer_2: aList.answer_2,
                                        answer_3: aList.answer_3,
                                        answer_lastday: aList.answer_lastday,
                                        answer_school: aList.answer_school,
                                        answer_academy: aList.answer_academy,
                                    });

                                    const questions = await getStoreData(`/api/user/today/question`, 'question-list', true);
                                    setAList(questions.response.answers[0].answers);

                                    await put('/api/user/today/sleep', {
                                        sleep_time: timeData.sleep,
                                        wakeup_time: timeData.wakeup,
                                    }).then(r => {
                                        console.log(r);
                                        console.log(timeData);
                                    });

                                    const times = await getStoreData(`/api/user/today/sleep`, 'sleep-time', true);
                                    setTimeData(times.response.sleep_info[0]);

                                    setError("");
                                }
                                setEditAnswer(!editAnswer)
                            }}
                        >
                            {(editAnswer) ? "응답 저장하기" : "응답 수정하기"}
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 w-full gap-4">
                <div className="items-center justify-center flex flex-col">
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
                        defaultValue={{
                            hour: timeData.sleep.split(':')[0] || null,
                            minute: timeData.sleep.split(':')[1] || null
                        }}
                    />
                </div>
                <div className="items-center justify-center flex flex-col">
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
                        defaultValue={{
                            hour: timeData.wakeup.split(':')[0],
                            minute: timeData.wakeup.split(':')[1]
                        }}
                    />
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
                            <TextareaAutosize
                                readOnly={!editAnswer}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': editAnswer}
                                )}
                                defaultValue={aList[key] || "아직 답하지 않았습니다."}
                                onChange={(e => {
                                    aList[key] = e.target.value
                                })}
                            />
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
                                readOnly={!editAnswer}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': editAnswer}
                                )}
                                defaultValue={aList[`answer_${index + 1}`] || "아직 답하지 않았습니다."}
                                onChange={(e => {
                                    aList[key] = e.target.value
                                })}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function IsAdmin({qList, setQList, userList}) {
    const [editQuestion, setEditQuestion] = useState(false);

    return (
        <div className="w-full p-6 space-y-8">
            <div className="flex items-center w-full justify-between">
                <div className="text-2xl text-gray-800 font-semibold">
                    오늘의 질문 목록
                </div>
                <div
                    className={cn(
                        "text-lg text-white rounded-lg font-semibold p-1",
                        {"bg-blue hover:bg-blue-700": !editQuestion},
                        {"bg-blue-700 hover:bg-blue": editQuestion}
                    )}
                    onClick={async () => {
                        if (editQuestion) {
                            await put('/api/admin/today/question', {
                                question_1: qList.question_1,
                                question_2: qList.question_2,
                                question_3: qList.question_3
                            });

                            const questions = await getStoreData(`/api/admin/today/question`, 'question-list', true);
                            setQList(questions.response.today_questions);
                        }
                        setEditQuestion(!editQuestion)
                    }}
                >
                    {(editQuestion) ? "저장하기" : "수정하기"}
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
                {Object.keys(qList).map((key) => {
                    if (key !== "date") {
                        return (
                            // eslint-disable-next-line react/jsx-key
                            <TextareaAutosize
                                key={key}
                                readOnly={!editQuestion}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': editQuestion}
                                )}
                                defaultValue={qList[key].toString()}
                                onChange={(e) => {
                                    qList[key] = e.target.value
                                }}
                            />
                        );
                    } else {
                    }
                })}
            </div>
            <div className="flex items-center w-full justify-between">
                <div className="text-2xl text-gray-800 font-semibold">
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
        </div>
    );
}