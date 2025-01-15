"use client";

import TextareaAutosize from "react-textarea-autosize";
import React, {useEffect, useState} from "react";
import {cn, getStoreData, post, put} from "@/app/(main)/components/functions";
import {TimeInput} from "@/app/(main)/components/common";
import Select from "react-select";

export function IsStudent(
    {
        timeData, setTimeData,
        aList, setAList,
        date,
        isMobile,
    }
) {
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

    const [answered, setAnswered] = useState(false);
    const [questionOK, setQuestionOK] = useState(false);

    useEffect(() => {
        const _params = `date=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        (async () => {
            let questions = await getStoreData(`/api/user/today/question?${_params}`, `question-list-${_params}`)
            if (new Date(questions.last_update).getDate() !== today.getDate()) {
                questions = await getStoreData(`/api/user/today/question?${_params}`, `question-list-${_params}`, true)
            }

            if (questions.response.success) {
                setQuestionOK(true);
                //----------------------------------------------
                const _q = Object.values(questions.response.answers[0].questions);
                const qArr = _q.concat("오늘의 학원 과제는?", "어젯밤 공부한 내용은?", "오늘의 학교 과제는?");
                const aArr = Object.values(questions.response.answers[0].answers);
                const qaArr = qArr.map((q, i) => {
                    return [q || "", aArr[i] || "아직 답하지 않았습니다."];
                });
                const qaObj = qaArr.reduce((map, value) => {
                    // @ts-ignore
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
        })();
    }, [date,])

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
            {questionOK ? (
                <>
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
                            if (q !== "") {
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
                            }
                        })}
                    </div>
                </>
            ) : (
                <div className="flex w-full h-full justify-center items-center text-xl font-bold">
                    질문이 등록되지 않았습니다.
                </div>
            )}
        </div>
    );
}

export function IsAdmin(
    {
        qList, setQList,
        date,
        tab
    }
) {
    const [editQuestion, setEditQuestion] = useState(false);
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const params = `date=${dateString}`;

    const [userList, setUserList] = useState([]);
    const [newUserList, setNewUserList] = useState([]);

    const [questionOK, setQuestionOK] = useState(false);
    const [head, setHead] = useState(-1);

    useEffect(() => {
        const _params = `date=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        (async () => {
            let questions = await getStoreData(`/api/admin/today/question?${_params}`, `question-list-${_params}`)
            if (new Date(questions.last_update).getDate() !== today.getDate()) {
                questions = await getStoreData(`/api/admin/today/question?${_params}`, `question-list-${_params}`, true)
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

            const users = (await getStoreData('/api/admin/user/list?search_by=user_type&search_string=1&order_by=name&order=ASC', 'user-list-student')).response.users;
            setUserList(users);
            setHead(users[0].uid);

            const newUsers = (await getStoreData('/api/admin/user/list?search_by=user_type&search_string=0&order_by=name&order=ASC', 'user-list-student-new')).response.users;
            setNewUserList(newUsers.map((u) => {
                return {...u, accept: false}
            }));
        })();
    }, [date,])

    const updateQuestion = async () => {
        if (editQuestion) {
            const body = {date: dateString};
            Array.from({length: 3, 0: 1}).map((_, i) => {
                if (qList[`question_${i + 1}`] !== "") {
                    body[`question_${i + 1}`] = qList[`question_${i + 1}`];
                }
            });
            console.log(body)
            await put('/api/admin/today/question', body);

            const questions = await getStoreData(`/api/admin/today/question?${params}`, `question-list-${params}`, true);
            setQList(questions.response.today_questions || {
                question_1: "",
                question_2: "",
                question_3: "",
                date: dateString,
            });
            setQuestionOK(questions.response.today_questions !== null);
        }
        setEditQuestion(!editQuestion)
    }

    const refreshUser = () => {
        (async () => {
            const users = (await getStoreData('/api/admin/user/list?search_by=user_type&search_string=1&order_by=name&order=ASC', 'user-list-student', true)).response.users;
            setUserList(users);
            setHead(users[0].uid);

            const newUsers = (await getStoreData('/api/admin/user/list?search_by=user_type&search_string=0&order_by=name&order=ASC', 'user-list-student-new', true)).response.users;
            setNewUserList(newUsers.map((u) => {
                return {...u, accept: false}
            }));
        })();
    }

    const [focusOnSearch, setFocusOnSearch] = useState(false);

    return (
        <div className="w-full h-fit pt-6 space-y-8">
            {(tab === 0) && (
                <>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-3xl text-gray-800 font-semibold">
                            오늘의 질문 목록 ({date.toLocaleDateString()})
                        </div>
                        {(today.getDate() === date.getDate()) && (
                            <div
                                className={cn(
                                    "px-3 py-1 text-white text-lg font-bold rounded w-fit",
                                    {"bg-blue hover:bg-blue-700": !editQuestion},
                                    {"bg-blue-700 hover:bg-blue": editQuestion}
                                )}
                                onClick={updateQuestion}
                            >
                                {(
                                    editQuestion
                                ) ? (
                                    "저장하기"
                                ) : (
                                    questionOK
                                ) ? (
                                    "수정하기"
                                ) : (
                                    "등록하기"
                                )}
                            </div>
                        )}
                    </div>
                    <div className="w-full space-y-4">
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
                                        value={q as string || ""}
                                        placeholder="질문을 입력해 주세요"
                                        onChange={(e) => {
                                            setQList((prev) => {
                                                const obj = {...prev};
                                                obj[key] = e.target.value || "";
                                                return obj;
                                            });
                                        }}
                                    />
                                );
                            } else {
                            }
                        })}
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
                    </div>
                </>
            )}
            {(tab === 1) && (
                <>
                    <div className="flex items-center w-full justify-between gap-4">
                        <div className="text-3xl text-gray-800 font-semibold">
                            학생 목록
                        </div>
                        <div
                            className={cn(
                                "border-2 py-1 px-3 flex-1 flex justify-between items-center gap-3",
                                {"border-black": focusOnSearch}
                            )}
                            onFocus={() => setFocusOnSearch(true)}
                            onBlur={() => setFocusOnSearch(false)}
                        >
                            <input
                                className="flex-1 bg-gray-100 outline-none"
                            />
                            <Select
                                options={[
                                    {value: "name", label: "이름"}
                                ]}
                                defaultValue={{value: "name", label: "이름"}}
                                components={{
                                    IndicatorSeparator: () => null
                                }}
                            />
                            <div
                                className="i-heroicons-outline-search"
                            />
                        </div>
                        <div
                            className="px-3 py-1 bg-blue-500 text-white text-lg font-bold rounded hover:bg-blue-600 w-fit"
                            onClick={refreshUser}
                        >
                            새로고침
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 h-full">
                        <div className="w-full space-y-4">
                            {userList.map((u) => {
                                return (
                                    <div
                                        key={u.uid}
                                        className={cn(
                                            "border-2 rounded flex w-full justify-between p-2 gap-8",
                                            {"border-black": u.uid === head}
                                        )}
                                        onClick={() => setHead(u.uid)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="text-xl font-bold">
                                                    {u.name as string}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {u.login_id as string}
                                                </div>
                                            </div>
                                            {/*<div>*/}
                                            {/*    {(u.user_type === 1) ? "S" : (u.user_type === 2) ? "T" : "A"}*/}
                                            {/*</div>*/}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center justify-end">
                                                {u.first_year as string} {u.joined_term as string}
                                            </div>
                                            <div className="flex items-center justify-end">
                                                {u.school as string}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="w-full h-full border-2 col-span-2">

                        </div>
                    </div>
                </>
            )}
            {(tab === 2) && (
                <>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-3xl text-gray-800 font-semibold">
                            신규 학생/선생님 목록
                        </div>
                        <div
                            className="px-3 py-1 bg-blue-500 text-white text-lg font-bold rounded hover:bg-blue-600 w-fit"
                            onClick={refreshUser}
                        >
                            새로고침
                        </div>
                    </div>
                    <div className="w-full space-y-4">
                        {newUserList.map((u, i) => {
                            return (
                                <div key={u.uid} className="flex flex-row w-full justify-between items-center gap-8">
                                    <div className="border-2 rounded flex p-2 items-center gap-8 flex-1">
                                        <div className="text-xl font-bold">
                                            {u.name as string}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {u.login_id as string}
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            "px-3 py-1 text-white text-lg font-bold rounded",
                                            (u.accept) ? "bg-blue-500" : "bg-green-500 hover:bg-green-600 w-fit"
                                        )}
                                        onClick={() => {
                                            post('/api/admin/user/accept', {user_id: u.uid});
                                            setNewUserList((users) => {
                                                let _users = [...users];
                                                _users[i].accept = true;
                                                return _users;
                                            })
                                        }}
                                    >
                                        {u.accept ? "승인완료" : "승인하기"}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    );
}