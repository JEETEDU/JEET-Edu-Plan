'use client';

import React, {useEffect, useState} from "react";
import {IUserInfo} from "@/app/(main)/(links)/mypage/(pages)/component/userList/userDetail";
import TextareaAutosize from "react-textarea-autosize";

export interface CTodayAnswer {
    date: Date;
    uid: number;
}

export function TodayAnswer({date, uid}: CTodayAnswer) {

    interface ITodaySleep {
        sleep: string | null;
        wakeup: string | null;
    }

    const [sleep, setSleep] = useState<ITodaySleep>({sleep: null, wakeup: null});

    interface ITodayAnswer {
        answer_1?: string;
        answer_2?: string;
        answer_3?: string;
        answer_lastday?: string;
        answer_academy?: string;
        answer_school?: string;
    }

    const [answer, setAnswer] = useState<ITodayAnswer>({});

    interface ITodayQuestion {
        question_1?: string;
        question_2?: string;
        question_3?: string;
        question_lastday?: string;
        question_academy?: string;
        question_school?: string;
    }

    const [question, setQuestion] = useState<ITodayQuestion>({
        question_lastday: "어젯밤 공부한 내용은?",
        question_academy: "오늘의 학원 과제는?",
        question_school: "오늘의 학교 과제는?",
    })

    useEffect(() => {
        const dateParams: string = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const param: string = `date=${dateParams}&search_by=user_id&search_string=${uid}&page=1&limit=1`;

        (async () => {
            interface IResponse {
                success: boolean;
                responses: [
                    {
                        user: IUserInfo;
                        sleep: ITodaySleep;
                        answers: ITodayAnswer;
                    },
                ];
                questions: ITodayQuestion;
            }

            const response: IResponse = await fetch(`/api/admin/today/response?${param}`, {
                method: 'GET',
            }).then(
                (res) => res.json()
            ).then(
                (res) => {
                    return res;
                }
            )

            if (response.success) {
                if (response.responses[0]) {
                    setAnswer(response.responses[0].answers || {});
                    setSleep(response.responses[0].sleep || {});
                } else {
                    setAnswer({});
                    setSleep({sleep: null, wakeup: null});
                }
                setQuestion((prev) => {
                    return {
                        ...prev,
                        ...response.questions,
                    }
                })
            } else {
                setAnswer({});
                setSleep({sleep: null, wakeup: null});
                setQuestion({
                    question_lastday: "어젯밤 공부한 내용은?",
                    question_academy: "오늘의 학원 과제는?",
                    question_school: "오늘의 학교 과제는?",
                })
            }
        })();
    }, [date, uid,])

    const [time_, setTime] = useState({
        sleep: "아직 응답하지 않았습니다.",
        wakeup: "아직 응답하지 않았습니다.",
    })
    useEffect(() => {
        if (sleep.sleep !== null && sleep.wakeup !== null) {
            setTime({
                sleep: `${(new Date(sleep.sleep)).getHours().toString().padStart(2, "0")} : ${(new Date(sleep.sleep)).getMinutes().toString().padStart(2, "0")}`,
                wakeup: `${(new Date(sleep.wakeup)).getHours().toString().padStart(2, "0")} : ${(new Date(sleep.wakeup)).getMinutes().toString().padStart(2, "0")}`,
            })
        } else {
            setTime({
                sleep: "아직 응답하지 않았습니다.",
                wakeup: "아직 응답하지 않았습니다.",
            })
        }
    }, [sleep]);

    return (
        <div className="flex flex-col justify-between gap-4">
            <div className="flex items-center w-full justify-between">
                <div className="text-2xl text-gray-800 font-semibold">
                    오늘의 질문 응답 ({date.toLocaleDateString()})
                </div>
                {/*<div className="flex items-center text-lg text-red-700 font-bold">*/}
                {/*    {error}*/}
                {/*</div>*/}
            </div>
            <div className="flex flex-col w-full h-full items-center p-1 space-y-4">
                <div className="grid w-full gap-4 grid-cols-2">
                    <div className="flex flex-col items-start w-full justify-between">
                        <label htmlFor="name" className="component-button-info">
                            취침시간
                        </label>
                        <div className="component-input resize-none text-center text-xl font-bold">
                            {time_.sleep}
                        </div>
                    </div>
                    <div className="flex flex-col items-start w-full justify-between">
                        <label htmlFor="name" className="component-button-info">
                            기상시간
                        </label>
                        <div className="component-input resize-none text-center text-xl font-bold">
                            {time_.wakeup}
                        </div>
                    </div>
                </div>
                <div className="w-full space-y-4">
                    {
                        [
                            '1',
                            '2',
                            '3',
                            'lastday',
                            'school',
                            'academy'
                        ].map((key, i) => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-expect-error
                            if (question[`question_${key}`] !== null) {
                                return (
                                    <div key={i}>
                                        <label htmlFor="name" className="component-button-info">
                                            {
                                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                // @ts-expect-error
                                                question[`question_${key}`]
                                            }
                                        </label>
                                        <TextareaAutosize
                                            readOnly
                                            className="component-input resize-none"
                                            cacheMeasurements
                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                            // @ts-expect-error
                                            value={answer[`answer_${key}`] || "아직 응답하지 않았습니다."}
                                        />
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
        </div>
    );
}