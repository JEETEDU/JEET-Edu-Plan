'use client';

import {cn, DELETE, GET, getStoreData, PUT} from "@/app/(main)/components/functions";
import React, {useEffect, useState} from "react";
import TextareaAutosize from "react-textarea-autosize";
import Select from "react-select";
import Scrollbars from "react-custom-scrollbars-2";
import Link from "next/link";

export function Alert({path, isMobile}: { path: string, isMobile: boolean }) {
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const toggleModal = () => setModalOpen((prev) => !prev);
    const [getOnlyUnread, setGetOnlyUnread] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");

    interface IAlert {
        id: number;
        user_id: number;
        read: number;
        alert_type: number;
        article_id: number | null;
        message: string;
    }

    const [alerts, setAlerts] = useState<IAlert[]>([]);

    function loadAlerts() {
        interface IResponse {
            success: boolean;
            alerts: IAlert[];
        }

        (async () => {
            setMessage("로딩중...");

            const response: IResponse = await GET(`/api/user/alert?unread=${getOnlyUnread}`);
            if (response.success) {
                setAlerts(response.alerts);
            }

            setMessage("");
        })();
    }

    useEffect(() => {
        if (isModalOpen) loadAlerts();
    }, [getOnlyUnread, isModalOpen]);

    function ReadAllAlerts() {
        return <button
            className="flex items-center flex-row gap-2 border-2 p-1 rounded"
            onClick={async () => {
                const r = await PUT('/api/user/alert/read', {
                    alert: alerts.map((alert) => alert.id)
                });
                if (r.success) {
                    loadAlerts();
                    setGetOnlyUnread(true);
                }
            }}
        >
            <div>모든 알림 읽기</div>
        </button>
    }

    function Shortcut({alert}: { alert: IAlert }) {
        return <>
            {(alert.article_id) && (
                <Link
                    className={cn(isMobile ? "w-full" : "w-fit", "border-2 rounded p-1 flex flex-col items-center gap-1 border-blue-500 bg-blue-500 text-white")}
                    onClick={async () => {
                        const r = await PUT('/api/user/alert/read', {
                            alert: [alert.id]
                        });
                        if (r.success) {
                            setModalOpen(false);
                        }
                    }}
                    href={`/board/${alert.article_id}`}
                >
                    <div className="w-fit whitespace-nowrap h-full flex items-center font-bold">
                        바로가기
                    </div>
                </Link>
            )}
        </>
    }

    function Read({alert}: { alert: IAlert }) {
        return <button
            className={cn("border-2 rounded p-1 flex justify-center items-center gap-1", isMobile ? 'w-full flex-row' : 'w-fit flex-col', {"border-green": (alert.read === 1)})}
            onClick={async () => {
                const r = await PUT('/api/user/alert/read', {
                    alert: [alert.id]
                });
                if (r.success) {
                    loadAlerts();
                }
            }}
        >
            <div className="w-fit whitespace-nowrap">
                읽기
            </div>
            <div className={(alert.read === 1) ? "i-system-uicons-check-circle-outside" : "i-system-uicons-circle"}/>
        </button>
    }

    function Delete({alert}: { alert: IAlert }) {
        return <button
            className={cn("border-2 rounded p-1 flex flex-col items-center gap-1 border-red-500 bg-red-500 text-white", isMobile ? "w-full" : "w-fit")}
            onClick={async () => {
                const r = await DELETE(`/api/user/alert/?alert_id=${alert.id}`);
                if (r.success) {
                    loadAlerts();
                }
            }}
        >
            <div className="w-fit whitespace-nowrap h-full flex items-center font-bold">
                삭제
            </div>
        </button>
    }

    return (path === '/') ? <></> : (
        <div className="flex items-center">
            <button
                onClick={toggleModal}
                className={cn("p-1 rounded", {"invisible": (path === '/')}, {'bg-red': (alerts.length !== 0)})}
            >
                <div className={cn((alerts.length !== 0) ? "i-system-uicons-bell-ringing bg-white" : "i-system-uicons-bell")}/>
            </button>
            {/* If there exist unread notice, "i-system-uicons-bell-ringing"   */}

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
                    onClick={toggleModal} // 모달 바깥 클릭 시 닫힘
                >
                    <div
                        className={cn("bg-white rounded-lg shadow-lg p-6 flex flex-col gap-8 w-9/10 max-h-9/10", {"h-9/10": (alerts.length !== 0)})}
                        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                    >
                        <div className="flex w-full justify-between items-center">
                            <div className="flex flex-row gap-2 items-center">
                                <div className={cn(isMobile ? "text-xl" : "text-2xl", "font-bold")}>알림</div>
                                <div className="text-green-700 font-bold">{message}</div>
                            </div>
                            <div className="flex items-center flex-row gap-4">
                                <button
                                    className="flex items-center flex-row gap-2 border-2 p-1 rounded"
                                    onClick={() => setGetOnlyUnread((prev) => !prev)}
                                >
                                    <div>읽은 알림 보이기</div>
                                    <div className={cn(getOnlyUnread ? "i-system-uicons-checkbox-empty" : "i-system-uicons-checkbox-checked")}
                                    />
                                </button>
                                {!isMobile && <ReadAllAlerts/>}
                            </div>
                        </div>

                        <Scrollbars
                            className="w-full flex-1 h-full"
                            autoHeight={(alerts.length === 0)}
                            // autoHeightMin={"flex-grow"}
                            universal
                            autoHide
                        >
                            <div className="flex items-center flex-col gap-2 w-full">
                                {alerts.map((alert) => {
                                    return (
                                        <div key={alert.id} className={cn("flex flex-col gap-3 justify-between w-full", {"border p-2 rounded": isMobile})}>
                                            <div className={cn("flex flex-row gap-3 justify-between w-full", {"border p-2 rounded": !isMobile})}>
                                                <div className={cn(
                                                    "w-fit rounded p-1 flex flex-col items-center gap-1 text-white font-bold text-sm whitespace-break-spaces align-middle justify-center bg-black",
                                                    {"bg-green-500": (alert.alert_type === 0)},
                                                    {"bg-blue-500": (alert.alert_type === 1)},
                                                )}
                                                >
                                                    {(alert.alert_type === 0) ? "일\n반" : (alert.alert_type === 1) ? "공\n지" : "기\n타"}
                                                </div>
                                                <div className="flex flex-1 items-center whitespace-pre-wrap">
                                                    {alert.message}
                                                </div>
                                                {!isMobile && <>
                                                    <Shortcut alert={alert}/>
                                                    <Read alert={alert}/>
                                                    <Delete alert={alert}/>
                                                </>}
                                            </div>
                                            {isMobile && <>
                                                <hr/>
                                                <div className="grid grid-cols-3 w-full justify-between gap-2">
                                                    <Delete alert={alert}/>
                                                    <Read alert={alert}/>
                                                    <Shortcut alert={alert}/>
                                                </div>
                                            </>}
                                        </div>
                                    );
                                })}
                                {(alerts.length === 0) && "읽지 않은 알림이 없습니다."}
                            </div>
                        </Scrollbars>
                        <div className="w-full flex justify-between items-center">
                            {isMobile && <ReadAllAlerts/>}
                            <button
                                onClick={toggleModal}
                                className="bg-blue-500 text-white px-4 py-2 rounded md:hover:bg-blue-600"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function TimeInput(
    {
        date, keyName, dateAction,
        className, onChangeAction = () => null, selectorPointerEventsNone = false
    }: {
        date: { success: boolean; sleep: Date; wakeup: Date }; keyName: "sleep" | "wakeup"; dateAction?: (t: { success: boolean; sleep: Date; wakeup: Date }) => void;
        className: string; onChangeAction?: () => void; selectorPointerEventsNone?: boolean;
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
                            value: String(i).padStart(2, "0"),
                            label: String(i).padStart(2, "0"),
                        }
                    ))}
                    required
                    onChange={(e) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        dateAction((t) => {
                            const obj = {...t};
                            obj[keyName].setHours(Number(e ? e.value : 12));
                            return obj;
                        })
                        onChangeAction();
                    }}
                    value={date.success ? {
                        value: date[keyName].getHours().toString().padStart(2, "0"),
                        label: date[keyName].getHours().toString().padStart(2, "0"),
                    } : {value: '--', label: '--'}}
                    isSearchable={false}
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
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        dateAction((t) => {
                            const obj = {...t};
                            obj[keyName].setMinutes(Number(e ? e.value : 0));
                            return obj;
                        })
                        onChangeAction();
                    }}
                    value={date.success ? {
                        value: date[keyName].getMinutes().toString().padStart(2, "0"),
                        label: date[keyName].getMinutes().toString().padStart(2, "0"),
                    } : {value: '--', label: '--'}}
                    isSearchable={false}
                />
                <div className="flex items-start justify-center text-xl">
                    분
                </div>
            </div>
        </div>
    );
}

export function TodayQuestion({device}: { device: string }) {
    const [answered, setAnswered] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const [userType, setUserType] = useState(0);

    const [qList, setQList] = useState({})
    const today = new Date();
    const [timeData, setTimeData] = useState<{ success: boolean; wakeup: Date; sleep: Date }>({
        success: true,
        wakeup: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7),
        sleep: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23),
    });

    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            const res = (await getStoreData('/api/user/info', 'user-info')).response;
            if (res.success) {
                const userInfo = res.user;
                setUserType(userInfo.user_type)

                if (userInfo.user_type === 1) {
                    const today = new Date();

                    let questions = await getStoreData(`/api/user/today/question`, 'question-list')
                    if (new Date(questions.last_update).getDate() !== today.getDate()) {
                        questions = await getStoreData(`/api/user/today/question`, 'question-list', true)
                    }

                    if (questions.response.success) {
                        setQList(questions.response.answers[0].questions);
                        setAnswered((questions.response.answers[0].answers.answer_1 !== null));
                    }
                }
            }
        })();
    }, [answered]);

    const register = async () => {

        const body = {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            answer_lastday: document.getElementById('y')!.value,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            answer_school: document.getElementById('s')!.value,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            answer_academy: document.getElementById('a')!.value
        };

        Object.entries(qList).map(([key, value], index) => {
            if (value !== null) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                body[`answer_${index + 1}`] = document.getElementById(key)!.value;
            }
        });

        if (timeData.sleep > timeData.wakeup) timeData.sleep.setDate(timeData.sleep.getDate() - 1);

        const r1 = await PUT('/api/user/today/sleep', {
            sleep: (new Date(timeData.sleep.getFullYear(), timeData.sleep.getMonth(), timeData.sleep.getDate(), timeData.sleep.getHours() + 9)).toISOString(),
            wakeup: (new Date(timeData.wakeup.getFullYear(), timeData.wakeup.getMonth(), timeData.wakeup.getDate(), timeData.wakeup.getHours() + 9)).toISOString(),
        });
        if (!r1.success) {
            return false;
        }

        const r2 = await PUT('/api/user/today/question', body);
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
        {(!answered && userType === 1) && (
            <div className="fixed inset-0 flex items-end justify-end z-5 pointer-events-none">
                <button
                    className={cn(
                        "py-2 px-2 rounded bg-blue-500 md:hover:shadow-2xl md:hover:bg-blue-600 border border-blueGray pointer-events-auto text-white font-bold",
                        (device === 'desktop') ?
                            "m-8 text-xl" :
                            "mr-3 mb-15"
                    )}
                    onClick={() => {
                        setShowQuestion(!showQuestion);
                    }}
                >
                    오늘의 질문 답하기
                </button>
            </div>
        )}
        {showQuestion && (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                onClick={() => setShowQuestion(p => !p)} // 모달 바깥 클릭 시 닫힘
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
                                date={timeData}
                                dateAction={setTimeData}
                                keyName={"sleep"}
                                onChangeAction={() => setError("")}
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
                                date={timeData}
                                dateAction={setTimeData}
                                keyName={"wakeup"}
                                onChangeAction={() => setError("")}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
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
                        {Object.entries(qList).map(([key, value]) => {
                            if (value !== null) {
                                return (
                                    // eslint-disable-next-line react/jsx-key
                                    <div key={key}>
                                        <label htmlFor="name" className="component-button-info">
                                            {value!.toString()}
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
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-red-600 font-bold">
                            {error}
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4">
                            <button
                                className="component-button bg-red-500 md:hover:bg-red-600"
                                onClick={() => setShowQuestion(p => !p)}
                            >
                                취소 (닫기)
                            </button>
                            <button
                                className="component-button"
                                onClick={() => {
                                    register().then(r => {
                                        if (r) {
                                            setAnswered(!answered);
                                            setShowQuestion(!showQuestion);
                                        } else {
                                            setError("정확한 정보를 입력해 주세요");
                                        }
                                    });
                                }}
                            >
                                제출하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>);
}