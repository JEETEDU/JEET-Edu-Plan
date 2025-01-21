'use client';

import React, {useEffect, useState} from "react";
import {IUserInfo} from "@/app/(main)/(links)/mypage/(pages)/userDetail";
import TextareaAutosize from "react-textarea-autosize";

export interface CTodayAnswer {
    date: Date;
    uid: number;
}

export function TodayAnswer({date, uid}: CTodayAnswer) {

    // const _a = [
    //     "answer_1",
    //     "answer_2",
    //     "answer_3",
    //     "answer_lastday",
    //     "answer_school",
    //     "answer_academy",
    // ]

    // const today = new Date();
    // const params = `date=${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    //
    // const [answered, setAnswered] = useState(false);
    // const [questionOK, setQuestionOK] = useState(false);

    interface ITodaySleep {
        sleep?: string;
        wakeup?: string;
    }

    const [sleep, setSleep] = useState<ITodaySleep>({});

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

            console.log('res', response)

            if (response.success) {
                if (response.responses[0]) {
                    setAnswer(response.responses[0].answers || {});
                    setSleep(response.responses[0].sleep || {});
                } else {
                    setAnswer({});
                    setSleep({});
                }
                setQuestion((prev) => {
                    return {
                        ...prev,
                        ...response.questions,
                    }
                })
            } else {
                setAnswer({});
                setSleep({});
                setQuestion({
                    question_lastday: "어젯밤 공부한 내용은?",
                    question_academy: "오늘의 학원 과제는?",
                    question_school: "오늘의 학교 과제는?",
                })
            }
        })();
    }, [date, uid,])

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
                            {sleep?.sleep || "아직 응답하지 않았습니다."}
                        </div>
                    </div>
                    <div className="flex flex-col items-start w-full justify-between">
                        <label htmlFor="name" className="component-button-info">
                            기상시간
                        </label>
                        <div className="component-input resize-none text-center text-xl font-bold">
                            {sleep?.wakeup || "아직 응답하지 않았습니다."}
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
                            if (question[`question_${key}`] !== null) {
                                return (
                                    <div key={i}>
                                        <label htmlFor="name" className="component-button-info">
                                            {question[`question_${key}`]}
                                        </label>
                                        <TextareaAutosize
                                            readOnly
                                            className="component-input resize-none"
                                            cacheMeasurements
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