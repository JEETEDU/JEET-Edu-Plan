"use client";

import TextareaAutosize from "react-textarea-autosize";
import React, {useEffect, useRef, useState} from "react";
import {cn, GET, getStoreData, POST, PUT} from "@/app/(main)/components/functions";
import {TimeInput} from "@/app/(main)/components/common";
import Select from "react-select";
import Scrollbars from "react-custom-scrollbars-2";
import UserDetail from "@/app/(main)/(links)/mypage/(pages)/component/userList/userDetail";
import Log from "@/app/(main)/(links)/mypage/(pages)/component/log";
import ClassSetting from "@/app/(main)/(links)/mypage/(pages)/component/classSetting";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";

export function IsStudent({date, isMobile}: { date: Date; isMobile: boolean }) {
    const [editAnswer, setEditAnswer] = useState(false);
    const [error, setError] = useState("");

    const [timeData, setTimeData] = useState<{ success: boolean; wakeup: Date; sleep: Date }>({
        success: false,
        wakeup: new Date(),
        sleep: new Date()
    });

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

    const [aList, setAList] = useState<[string, string][]>([]);

    useEffect(() => {
        const _params = `date=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        (async () => {
            let questions = await getStoreData(`/api/user/today/question?${_params}`, `question-list-${_params}`)
            if (new Date(questions.last_update).getDate() !== today.getDate()) {
                questions = await getStoreData(`/api/user/today/question?${_params}`, `question-list-${_params}`, true)
            }

            console.log(questions);

            if (questions.response.success) {
                //----------------------------------------------
                const _q: string[] = Object.values(questions.response.answers[0].questions);
                const qArr = _q.concat("오늘의 학원 과제는?", "어젯밤 공부한 내용은?", "오늘의 학교 과제는?");
                const aArr: string[] = Object.values(questions.response.answers[0].answers);
                const qaArr: [string, string][] = qArr.map((q, i) => {
                    return [q || "", aArr[i]];
                });
                console.log(qaArr)
                //----------------------------------------------
                setAList(qaArr);
                setAnswered(Boolean(questions.response.answers[0].answers.answer_1 !== null));
            }

            let times: {
                last_update: Date;
                response: {
                    success: true;
                    sleep_info: {
                        sleep: string;
                        wakeup: string;
                    }
                } | {
                    success: false;
                    message: string;
                }
            } = await getStoreData(`/api/user/today/sleep?${_params}`, `sleep-time-${_params}`);
            if (new Date(times.last_update).getDate() !== today.getDate()) {
                times = await getStoreData(`/api/user/today/sleep?${_params}`, `sleep-time-${_params}`, true);
            }
            console.log('t', times);

            if (times.response.success) {
                setTimeData({
                    success: true,
                    sleep: new Date(times.response.sleep_info.sleep),
                    wakeup: new Date(times.response.sleep_info.wakeup),
                });
            } else {
                setTimeData({
                    success: false,
                    sleep: new Date(),
                    wakeup: new Date(),
                });
            }
        })();
    }, [date,])

    const update = async () => {
        if (editAnswer) {
            setError("저장중...");

            const body = aList.reduce((obj, val, idx) => {
                if (val[0] !== "") {
                    obj[_a[idx]] = val[1];
                }
                return obj;
            }, {});
            console.log(body)

            const r1 = await PUT('/api/user/today/question', body);

            const questions = await getStoreData(`/api/user/today/question?${params}`, `question-list-${params}`, true);

            //---
            const _q = Object.values(questions.response.answers[0].questions);
            const qArr = _q.concat("오늘의 학원 과제는?", "어젯밤 공부한 내용은?", "오늘의 학교 과제는?");
            const aArr = Object.values(questions.response.answers[0].answers);
            const qaArr: Array = qArr.map((q, i) => {
                return [q || "", aArr[i]];
            });
            console.log(qaArr)
            setAList(qaArr);

            if (timeData.sleep > timeData.wakeup) timeData.sleep.setDate(timeData.sleep.getDate() - 1);

            const r2 = await PUT('/api/user/today/sleep', {
                sleep: (new Date(timeData.sleep.getFullYear(), timeData.sleep.getMonth(), timeData.sleep.getDate(), timeData.sleep.getHours() + 9)).toISOString(),
                wakeup: (new Date(timeData.wakeup.getFullYear(), timeData.wakeup.getMonth(), timeData.wakeup.getDate(), timeData.wakeup.getHours() + 9)).toISOString(),
            });

            if (r1 && r2) {
                alert('저장되었습니다!');
                sessionStorage.clear();

                const times: {
                    last_update: Date;
                    response: {
                        success: true;
                        sleep_info: {
                            sleep: string;
                            wakeup: string;
                        }
                    } | {
                        success: false;
                        message: string;
                    }
                } = await getStoreData(`/api/user/today/sleep?${params}`, `sleep-time-${params}`, true);

                if (times.response.success) {
                    setTimeData({
                        success: true,
                        sleep: new Date(times.response.sleep_info.sleep),
                        wakeup: new Date(times.response.sleep_info.wakeup),
                    });
                } else {
                    setTimeData({
                        success: false,
                        sleep: new Date(),
                        wakeup: new Date(),
                    });
                }
            }

            setError("");
        }
        setEditAnswer(!editAnswer)
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
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
                        <button
                            className={cn(
                                "text-white rounded-lg font-semibold p-1",
                                {"bg-blue hover:bg-blue-700": !editAnswer},
                                {"bg-blue-700 hover:bg-blue": editAnswer},
                                {"text-lg": !isMobile}
                            )}
                            onClick={update}
                        >
                            {(editAnswer) ? "응답 저장하기" : "응답 수정하기"}
                        </button>
                    </div>
                )}
            </div>
            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
            >
                {(answered) ? (

                    <div className={cn(
                        "flex flex-col w-full h-full items-center p-1 space-y-4"
                    )}>
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
                                    date={timeData}
                                    keyName={"sleep"}
                                    dateAction={setTimeData}
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
                                    date={timeData}
                                    keyName={"wakeup"}
                                    dateAction={setTimeData}
                                    // onChange={() => setError("")}
                                    selectorPointerEventsNone={!editAnswer}
                                />
                            </div>
                        </div>
                        <div className="w-full space-y-4">
                            {aList.map(([q, a], i) => {
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
                                                value={a || ""}
                                                onChange={(e) => {
                                                    setAList((prev) => {
                                                        const _arr = [...prev];
                                                        _arr[i] = [q, e.target.value];
                                                        return _arr;
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                }
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-xl font-bold">
                        아직 응답하지 않았습니다.
                    </div>
                )}
            </Scrollbars>
        </div>
    );
}

export interface IListUser {
    uid: number;
    login_id: string;
    user_type: number;
    name: string;
    first_year: number;
    school: string;
    joined_term: string;
    classes: {
        id: number;
        name: string;
    }[];
    selected?: boolean;
}

export function IsAdmin(
    {
        qList, setQList,
        date,
    }
) {
    const [editQuestion, setEditQuestion] = useState(false);
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const params = `date=${dateString}`;

    const [userList, setUserList] = useState<IListUser[]>([]);
    const [newUserList, setNewUserList] = useState<IListUser[]>([]);

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
        })();
    }, [date,])

    useEffect(() => {
        (async () => {
            const users = (await getStoreData('/api/admin/user?user_type=1&order_by=name&order=ASC&limit=10', 'user-list-student')).response.users;
            setUserList(users || []);
            if (users) if (users.length > 0) setHead(users[0].uid || 0);

            const newUsers = (await getStoreData('/api/admin/user?user_type=0&order_by=name&order=ASC', 'user-list-student-new')).response.users;
            setNewUserList(newUsers.map((u) => {
                return {
                    ...u,
                    accept: false,
                    reject: false
                }
            }));
        })();
    }, []);

    const updateQuestion = async () => {
        if (editQuestion) {
            const body = {date: dateString};
            Array.from({length: 3, 0: 1}).map((_, i) => {
                if (qList[`question_${i + 1}`] !== "") {
                    body[`question_${i + 1}`] = qList[`question_${i + 1}`];
                }
            });
            console.log(body)
            await PUT('/api/admin/today/question', body);

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

    const [userParams, setUserParams] = useState({
        user_type: "1",
        search_by: "name",
        search_string: ""
    });

    const [focusOnSearch, setFocusOnSearch] = useState(false);

    const [tab, setTab] = useState(0);
    const [tabList, setTabList] = useState({
        "오늘의 질문": true,
        "유저 목록": true,
        "신규 유저 승인": true,
        "반 관리": true,
        "설정": true,
        "Log List": false
    });

    useEffect(() => {
        refreshUser();
    }, [userParams,]);

    useEffect(() => {
        if (tab === 1) {
            refreshUser();
        } else if (tab === 2) {
            refreshNewUser();
        }
    }, [tab,]);

    const [page, setPage] = useState(1);
    const scrollbars = useRef<Scrollbars>(null);

    const _param = Object.entries(userParams).reduce((str, [k, v]) => {
        if (v !== "") {
            return `${str}&${String(k)}=${String(v)}`;
        } else {
            return str;
        }
    }, "order_by=name&order=ASC");

    const refreshUser = (refreshHead: boolean = true) => {
        setPage(1);
        (async () => {
            const res: { success: boolean; users: IListUser[] } = await GET(`/api/admin/user?page${_param}`);
            if (res.success) {
                setUserList(res.users);
                if (refreshHead && res.users.length > 0) {
                    setHead(res.users[0].uid || 0);
                }
            }

        })().then(() => {
            if (scrollbars.current) scrollbars.current.scrollToTop();
        });
    }

    const nextPage = () => {
        (async () => {
            const res: { success: boolean; users: IListUser[] } = await GET(`/api/admin/user?page=${page}&${_param}`);
            if (res.success) setUserList((prev) => [...prev, ...(res.users)]);
        })();
    }

    useEffect(() => {
        if (page !== 1) nextPage();
    }, [page]);

    const refreshNewUser = () => {
        (async () => {
            const newUsers = (await getStoreData('/api/admin/user?user_type=0&order_by=name&order=ASC', 'user-list-student-new', true)).response.users;
            setNewUserList(newUsers.map((u) => {
                return {...u, accept: false}
            }));
        })();
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div
                className="grid text-xl font-bold gap-2 items-center h-fit grid-cols-4"
                style={{gridTemplateColumns: `repeat(${Object.entries(tabList).filter(t => t[1]).length}, minmax(0, 1fr))`}}
            >
                {Object.entries(tabList).filter(t => t[1]).map((t, i) => {
                    return (
                        <button
                            key={i}
                            className={cn(
                                "flex justify-center hover:bg-gray-300 p-1 rounded",
                                {"border-2 border-gray": (i === tab)}
                            )}
                            onClick={() => setTab(i)}
                        >
                            {t[0]}
                        </button>
                    )
                })}
            </div>
            {(tab === 0) && (
                <>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-3xl text-gray-800 font-semibold">
                            오늘의 질문 목록 ({date.toLocaleDateString()})
                        </div>
                        {(today.getDate() === date.getDate()) && (
                            <button
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
                            </button>
                        )}
                    </div>
                    <Scrollbars
                        className="w-full flex-1"
                        universal
                        autoHide
                    >
                        <div className="flex flex-col w-full items-center p-1 space-y-4">
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
                    </Scrollbars>
                </>
            )}
            {(tab === 1) && (
                <>
                    <div className="flex items-start w-full justify-between gap-4">
                        <Select
                            className="text-lg font-bold"
                            options={[
                                {value: "1", label: "학생 목록"},
                                {value: "2", label: "선생 목록"},
                                {value: "3", label: "관리자"},
                            ]}
                            defaultValue={{value: "1", label: "학생 목록"}}
                            onChange={(e) => {
                                setUserParams((prev) => {
                                    const obj = {...prev};
                                    obj.user_type = e.value;
                                    return obj;
                                })
                            }}
                            components={{
                                IndicatorSeparator: () => null
                            }}
                            isSearchable={false}
                        />
                        <Select
                            options={[
                                {value: "name", label: "이름 (ex. 나태양)"},
                                {value: "first_year", label: "중학교 입학 년도 (ex. 2024)"},
                                {value: "school", label: "중학교 이름 (ex. 지트중학교, 지트중)"},
                                {value: "joined_term", label: "지트 등록 분기 (ex. J)"},
                            ]}
                            placeholder={'검색 조건'}
                            onChange={(e) => {
                                setUserParams((prev) => {
                                    const obj = {...prev};
                                    obj.search_by = e.value;
                                    return obj;
                                })
                            }}
                            defaultValue={{value: "name", label: "이름 (ex. 나태양)"}}
                            components={{
                                IndicatorSeparator: () => null
                            }}
                            isSearchable={false}
                        />
                        <div
                            className={cn(
                                "border-2 py-1 px-3 flex-1 flex justify-between items-center gap-3 rounded",
                                {"border-black": focusOnSearch}
                            )}
                            onFocus={() => setFocusOnSearch(true)}
                            onBlur={() => setFocusOnSearch(false)}
                        >
                            <input
                                className="flex-1 bg-gray-100 outline-none"
                                onChange={(e) => {
                                    setUserParams((prev) => {
                                        const obj = {...prev};
                                        obj.search_string = e.target.value;
                                        return obj;
                                    })
                                }}
                            />
                            <button
                                className="i-heroicons-outline-search"
                                onClick={() => refreshUser()}
                            />
                        </div>
                        <button
                            className="px-3 py-1 bg-blue-500 text-white text-lg font-bold rounded hover:bg-blue-600 w-fit"
                            onClick={refreshUser}
                        >
                            새로고침
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-6 h-full">
                        <Scrollbars
                            className="w-full flex-1"
                            universal
                            autoHide
                            ref={scrollbars}
                            onScrollStop={async () => {
                                if (scrollbars.current!.getScrollHeight() - scrollbars.current!.getClientHeight() <= scrollbars.current!.getScrollTop() + 10) {
                                    setPage((p) => {
                                        if (userList.length === 10 * p) {
                                            return p + 1;
                                        } else {
                                            return p;
                                        }
                                    });
                                }
                            }}
                        >
                            <div className="flex flex-col w-full items-center space-y-4 pb-3">
                                {userList.map((u) => {
                                    return (
                                        <div
                                            key={u.uid}
                                            className={cn(
                                                "border-2 rounded flex w-full justify-between p-2 gap-8 cursor-pointer hover:bg-white",
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
                        </Scrollbars>
                        <Scrollbars
                            className="w-full flex-1 col-span-3"
                            universal
                            autoHide
                        >
                            <UserDetail
                                uid={head}
                                date={date}
                                refreshAction={refreshUser}
                            />
                        </Scrollbars>
                    </div>
                </>
            )}
            {(tab === 2) && (
                <>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-3xl text-gray-800 font-semibold">
                            신규 학생/선생님 목록
                        </div>
                        <button
                            className="px-3 py-1 bg-blue-500 text-white text-lg font-bold rounded hover:bg-blue-600 w-fit"
                            onClick={refreshNewUser}
                        >
                            새로고침
                        </button>
                    </div>
                    <Scrollbars
                        className="w-full flex-1"
                        universal
                        autoHide
                    >
                        <div className="flex flex-col w-full items-center space-y-4">
                            {(newUserList.length === 0) && (
                                <div className="flex w-full h-full items-center bg-gray-100 justify-center text-xl font-bold">
                                    신규 유저가 없습니다.
                                </div>
                            )}
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
                                        <div className="flex flex-row gap-2">
                                            <button
                                                className={cn(
                                                    "px-3 py-1 text-white text-lg font-bold rounded",
                                                    (u.reject) ? "bg-black" : "bg-red-500 hover:bg-red-600 w-fit"
                                                )}
                                                onClick={() => {
                                                    POST('/api/admin/user/reject', {user_id: u.uid});
                                                    setNewUserList((users) => {
                                                        const _users = [...users];
                                                        _users[i].reject = true;
                                                        return _users;
                                                    })
                                                }}
                                            >
                                                {u.reject ? "거절완료" : "거절하기"}
                                            </button>
                                            <button
                                                className={cn(
                                                    "px-3 py-1 text-white text-lg font-bold rounded",
                                                    (u.reject) ? "bg-gray-500" : (u.accept) ? "bg-blue-500" : "bg-green-500 hover:bg-green-600 w-fit",
                                                    {"pointer-events-none": (u.reject)},
                                                )}
                                                onClick={() => {
                                                    POST('/api/admin/user/accept', {user_id: u.uid});
                                                    setNewUserList((users) => {
                                                        const _users = [...users];
                                                        _users[i].accept = true;
                                                        return _users;
                                                    })
                                                }}
                                            >
                                                {u.accept ? "승인완료" : "승인하기"}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Scrollbars>
                </>
            )}
            {(tab === 3) && (
                <ClassSetting/>
            )}
            {(tab === 4) && (
                <>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-3xl text-gray-800 font-semibold">
                            설정
                        </div>
                    </div>
                    <Scrollbars
                        className="w-full flex-1"
                        universal
                        autoHide
                    >
                        <div className="flex flex-col w-full items-start p-1 space-y-4">
                            <div className="flex items-center">
                                <input
                                    checked={tabList["Log List"]}
                                    id="checked-checkbox"
                                    type="checkbox"
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    onChange={() => setTabList(prev => {
                                        return {
                                            ...prev,
                                            "Log List": !prev["Log List"],
                                        }
                                    })}
                                />
                                <label htmlFor="checked-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">푸쉬 알림 동의</label>
                            </div>
                            <Hr/>
                            <div className="text-xl text-gray-800 font-semibold">
                                개발자 설정 (새로고침 시 초기화됩니다.)
                            </div>
                            <div className="flex items-center">
                                <input
                                    checked={tabList["Log List"]}
                                    id="checked-checkbox"
                                    type="checkbox"
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    onChange={() => setTabList(prev => {
                                        return {
                                            ...prev,
                                            "Log List": !prev["Log List"],
                                        }
                                    })}
                                />
                                <label htmlFor="checked-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">사용자 로그 보이기</label>
                            </div>
                        </div>
                    </Scrollbars>
                </>
            )}
            {(tab === 5) && (
                <Log/>
            )}
        </div>
    );
}