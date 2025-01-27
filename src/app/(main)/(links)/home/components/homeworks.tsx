'use client';

import Scrollbars from "react-custom-scrollbars-2";
import React, {useEffect, useRef, useState} from "react";
import {cn, GET, PUT} from "@/app/(main)/components/functions";
import Select from "react-select";
import DatePicker from "react-datepicker";

import 'react-datepicker/dist/react-datepicker.css';
import {ko} from "date-fns/locale";
import styled from "styled-components";
import {useRouter} from "next/navigation";

interface IHomework {
    article_id: number;
    due_date: string;
    done: number;
    title: string;
    subject: {
        name: string;
        id: number;
    },
    class_: {
        name: string;
        id: number;
    }
}

interface IClass {
    id: number;
    name: string;
    description: string;
}

interface ISubject {
    id: number;
    name: string;
}

interface IClassInfo {
    id: number;
    name: string;
    subjects: ISubject[];
}

export const DatepickerWrapper = styled.div`
    .react-datepicker {

        padding: 10px 10px 0 10px;

        .react-datepicker__header {
            background-color: #fff;
            color: #fff;
            border-bottom: none;
            border-radius: 0;
        }

        .react-datepicker__month-container {

            //padding-bottom: 10px;
            margin-bottom: 8px;

            .react-datepicker__day-names {

                width: 280px;
                @media (max-width: 600px) {
                    width: 200px;
                }
                display: flex;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;

                .react-datepicker__day-name {
                    display: flex;
                    width: 40px;
                    height: 40px;
                    @media (max-width: 600px) {
                        height: 30px;
                    }
                    justify-content: center;
                    align-items: center;
                }
            }

            .react-datepicker__month {
                margin: 0;
            }

            .react-datepicker__week {

                width: 280px;
                @media (max-width: 600px) {
                    width: 200px;
                }
                display: flex;
                justify-content: space-around;

                > * {
                    display: flex;
                    width: 40px;
                    height: 40px;
                    @media (max-width: 600px) {
                        height: 30px;
                    }
                    justify-content: center;
                    align-items: center;
                    color: #494A50;
                    text-align: center;

                    //font-family: Inter, serif;
                    font-size: 12px;
                    font-style: normal;
                    font-weight: 700;
                    line-height: normal;
                }

                .react-datepicker__day--selected {
                    border-radius: 0.25rem;
                    background: #006FFD;
                    display: flex;
                    width: 40px;
                    height: 40px;
                    @media (max-width: 600px) {
                        height: 30px;
                    }
                    justify-content: center;
                    align-items: center;
                    color: #fff;
                }
            }

            .react-datepicker__day--disabled {
                background: lightgray;
                border-radius: 0.25rem;
                color: gray
            }
        }

        .react-datepicker__children-container {
            width: 300px;
            @media (max-width: 600px) {
                width: 220px;
            }
        }
    }
`

export function DateRangePicker(
    {
        startDueDate,
        setStartDueDateAction,
        endDueDate,
        setEndDueDateAction,
        closeAction,
        isMobile,
        minDate,
        maxDate
    }: {
        startDueDate: Date | null;
        setStartDueDateAction: React.Dispatch<React.SetStateAction<Date | null>>;
        endDueDate: Date | null;
        setEndDueDateAction: React.Dispatch<React.SetStateAction<Date | null>>;
        closeAction: React.Dispatch<React.SetStateAction<boolean>>;
        isMobile: boolean;
        minDate?: Date;
        maxDate?: Date;
    }
) {
    return (
        <div
            className="flex flex-col bg-gray-100 gap-4 p-4 rounded items-center"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-full flex items-center justify-center text-center text-xl font-bold">
                {(startDueDate !== null) && ` ${startDueDate.toLocaleDateString()} `}
                {((startDueDate !== null) || (endDueDate !== null)) && "~"}
                {(endDueDate !== null) && ` ${endDueDate.toLocaleDateString()} `}
                {((startDueDate === null) && (endDueDate === null)) && "전체 날짜"}
            </div>
            <div className={cn("flex gap-4", isMobile ? "flex-col" : "flex-row")}>
                <DatepickerWrapper className="w-fit text-center flex gap-4 justify-center">
                    <DatePicker
                        className="outline-none"
                        locale={ko}
                        isClearable
                        selected={startDueDate}
                        onChange={(e) => {
                            setStartDueDateAction(e);
                            if ((e !== null) && (endDueDate !== null)) {
                                if (e > endDueDate) {
                                    setEndDueDateAction(e);
                                }
                            }
                        }}
                        dateFormat='yyyy-MM-dd'
                        placeholderText="전체 기한"
                        inline
                        minDate={minDate}
                    />
                    {(isMobile) && (
                        <div
                            className="bg-green-500 px-1 text-white flex justify-center items-center rounded"
                            onClick={() => setStartDueDateAction(null)}
                        >
                            <div className="i-system-uicons:cross-circle"/>
                        </div>
                    )}
                </DatepickerWrapper>
                <DatepickerWrapper className="w-fit text-center flex gap-4 justify-center">
                    <DatePicker
                        className="outline-none"
                        locale={ko}
                        selected={endDueDate}
                        onChange={(e) => setEndDueDateAction(e)}
                        dateFormat='yyyy-MM-dd'
                        placeholderText="전체 기한"
                        inline
                        minDate={startDueDate || new Date("")}
                        maxDate={maxDate}
                    />
                    {(isMobile) && (
                        <div
                            className="bg-green-500 px-1 text-white flex justify-center items-center rounded"
                            onClick={() => setEndDueDateAction(null)}
                        >
                            <div className="i-system-uicons:cross-circle"/>
                        </div>
                    )}
                </DatepickerWrapper>
            </div>
            <div className={cn("grid w-full", isMobile ? "grid-cols-2" : "grid-cols-4 gap-4")}>
                {(!isMobile) && (
                    <div
                        className="flex items-center justify-center text-center bg-green-500 hover:bg-green-600 text-white py-1 rounded"
                        onClick={() => setStartDueDateAction(null)}
                    >
                        시작 날짜 제거
                    </div>
                )}
                <div
                    className="col-span-2 flex items-center justify-center text-center bg-blue-500 hover:bg-blue-600 text-white py-1 rounded"
                    onClick={() => closeAction(false)}
                >
                    저장하기
                </div>
                {(!isMobile) && (
                    <div
                        className="flex items-center justify-center text-center bg-green-500 hover:bg-green-600 text-white py-1 rounded"
                        onClick={() => setEndDueDateAction(null)}
                    >
                        끝 날짜 제거
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Homeworks({isMobile = false, setHeadAction = () => void null}: { isMobile?: boolean; setHeadAction?: (h: number) => void }) {
    const [homeworks, setHomeworks] = useState<IHomework[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);

    const [page, setPage] = useState<number>(1);

    const [done, setDone] = useState<{ value: string, label: string }>({value: "0", label: "남은 숙제"});
    const [class_, setClass] = useState<{ value: string, label: string }>({value: "", label: "전체 반"});
    const [subject, setSubject] = useState<{ value: string, label: string }>({value: "", label: "전체 과목"});
    const today = new Date();
    const [startDueDate, setStartDueDate] = useState<Date | null>(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const [endDueDate, setEndDueDate] = useState<Date | null>(null);
    const [param, setParam] = useState<string>("");

    function reload(append: boolean = false) {
        (async () => {
            const pageParam = append ? `page=${page}` : "page=1";
            const res: { success: boolean, homeworks: IHomework[] } = await GET(`/api/user/homework?${pageParam}${param}`);
            if (res.success) {
                if (append) {
                    setHomeworks(prev => [...prev, ...(res.homeworks)]);
                } else {
                    setHomeworks(res.homeworks);
                    if ((res.homeworks.length > 0) && (!isMobile)) setHead(res.homeworks[0].article_id);
                }
                // setHomeworks(res.homeworks);
            } else {
                setHomeworks([]);
            }
        })();
    }

    useEffect(() => {
        setPage(1);
        if (param !== "") reload();
    }, [param,]);

    useEffect(() => {
        if (page > 1) reload(true);
    }, [page]);

    function parseDate(date: Date): string {
        return `${date.getFullYear()}-${(String(date.getMonth() + 1)).padStart(2, '0')}-${(String(date.getDate())).padStart(2, '0')}`;
    }

    useEffect(() => {
        let p = ``;
        if (done.value !== "") p += `&done=${done.value}`;
        if (class_.value !== "") p += `&class_id=${class_.value}`;
        if (subject.value !== "") p += `&subject_id=${subject.value}`;
        if (startDueDate !== null) p += `&start_due_date=${parseDate(startDueDate)}`;
        if (endDueDate !== null) p += `&end_due_date=${parseDate(endDueDate)}`;

        setParam(p);
    }, [done, class_, subject, startDueDate, endDueDate]);

    useEffect(() => {
        (async () => {
            const res: { success: boolean, classes: IClass[] } = await GET('/api/user/class');
            if (res.success) {
                setClasses(res.classes);
            } else {
                setClasses([]);
            }
        })();
    }, []);

    useEffect(() => {
        setSubject({value: "", label: "전체 과목"});
        if (class_.value !== "") {
            (async () => {
                const res: { success: boolean, class: IClassInfo } = await GET(`/api/class/${class_.value}`);
                if (res.success) {
                    setSubjects(res.class.subjects);
                } else {
                    setSubjects([]);
                }
            })();
        } else {
            setSubjects([]);
        }
    }, [class_]);

    const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);

    const [head, setHead] = useState<number>(0);

    useEffect(() => {
        setHeadAction(head)
    }, [head, setHeadAction]);

    const scrollbars = useRef<Scrollbars>(null);

    const router = useRouter();

    return (
        <div className="flex flex-col w-full h-full gap-2">
            <div className="flex flex-col w-full gap-2">
                <div className="grid grid-cols-3 gap-2 items-end">
                    <Select
                        // menuPlacement="top"
                        className="text-center"
                        components={{
                            IndicatorSeparator: () => null
                        }}
                        options={[
                            {value: "", label: "전체 숙제"},
                            {value: "0", label: "남은 숙제"},
                            {value: "1", label: "끝낸 숙제"},
                        ]}
                        required
                        value={done}
                        instanceId={1}
                        onChange={(e) => setDone(e!)}
                        isSearchable={false}
                    />

                    {(!isMobile) && (<>
                        <Select
                            // menuPlacement="top"
                            components={{
                                IndicatorSeparator: () => null
                            }}
                            className="text-center"
                            options={[
                                {value: "", label: "전체 반"},
                                ...(classes.map((c) => {
                                    return {value: String(c.id), label: c.name};
                                }))
                            ]}
                            required
                            value={class_}
                            instanceId={1}
                            onChange={(e) => setClass(e!)}
                            isSearchable={false}
                        />
                        <Select
                            // menuPlacement="top"
                            components={{
                                IndicatorSeparator: () => null
                            }}
                            className="text-center"
                            options={[
                                {value: "", label: "전체 과목"},
                                ...(subjects.map((s) => {
                                    return {value: String(s.id), label: s.name};
                                }))
                            ]}
                            required
                            value={subject}
                            instanceId={1}
                            onChange={(e) => setSubject(e!)}
                            isSearchable={false}
                        />
                    </>)}
                    <div className={cn("flex items-center", isMobile ? "flex-col col-span-2" : "grid grid-cols-3 col-span-3 gap-2")}>
                        <div className={isMobile ? "component-button-info w-full justify-start items-end h-fit" : "flex justify-end items-center"}>
                            마감일로 검색:
                        </div>
                        <div className={cn("w-full flex flex-row justify-between gap-2 items-center", isMobile ? "" : "col-span-2")}>
                            {(openDatePicker) && (
                                <div
                                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                                    onClick={() => setOpenDatePicker(false)} // 모달 바깥 클릭 시 닫힘
                                >
                                    <DateRangePicker
                                        startDueDate={startDueDate}
                                        setStartDueDateAction={setStartDueDate}
                                        endDueDate={endDueDate}
                                        setEndDueDateAction={setEndDueDate}
                                        isMobile={isMobile}
                                        closeAction={setOpenDatePicker}
                                    />
                                </div>
                            )}
                            <button
                                className="w-full py-1 justify-center items-center text-center border-2 rounded bg-white flex"
                                onClick={() => setOpenDatePicker(true)}
                            >
                                {(startDueDate !== null) && ` ${startDueDate.toLocaleDateString()} `}
                                {((startDueDate !== null) || (endDueDate !== null)) && "~"}
                                {(endDueDate !== null) && ` ${endDueDate.toLocaleDateString()} `}
                                {((startDueDate === null) && (endDueDate === null)) && "전체 날짜"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
                ref={scrollbars}
                onScrollStop={() => {
                    if (scrollbars.current!.getScrollHeight() - scrollbars.current!.getClientHeight() <= scrollbars.current!.getScrollTop() + 10) {
                        if (homeworks.length === 10 * page) setPage(p => p + 1);
                    }
                }}
            >
                <div className="flex flex-col w-full gap-2">
                    {homeworks.map((homework, index) => (
                        <div
                            key={index}
                            className="flex flex-row w-ful w-full pr-1"
                        >
                            <div
                                className={cn(
                                    "p-2 rounded-l flex items-center justify-center border-2 text-xl cursor-pointer",
                                    (homework.done === 1) ? "bg-green-500 border-green-500 text-white"
                                        : "",
                                    (!isMobile) ? (homework.done === 1) ? "hover:bg-red-500 hover:border-red-500" : "hover:bg-blue hover:border-blue hover:text-white" : "",
                                    (homework.article_id === head) ? "border-black" : ""
                                )}
                                onClick={async () => {
                                    if (homework.done === 0) {
                                        const res = confirm("숙제를 완료하였습니까?");
                                        if (res) {
                                            const r = await PUT('/api/user/homework/done', {
                                                article_id: homework.article_id
                                            });
                                            if (r.success) reload();
                                        }
                                    } else if (homework.done === 1) {
                                        const res = confirm("숙제 완료를 취소하시겠습니까?");
                                        if (res) {
                                            const r = await PUT('/api/user/homework/undone', {
                                                article_id: homework.article_id
                                            });
                                            if (r.success) reload();
                                        }
                                    }
                                }}
                            >
                                {(homework.done === 0) ? (
                                    <div className="i-system-uicons:circle"/>
                                ) : (
                                    <div className="i-system-uicons:check-circle-outside"/>
                                )}
                            </div>
                            <div
                                className={cn("h flex-1 border-y-2 border-r-2 rounded-r flex flex-row p-2 gap-2 hover:bg-white items-center", {"border-black": (homework.article_id === head)})}
                                onClick={() => {
                                    if (isMobile) {
                                        router.push(`/board/${homework.article_id}`)
                                    } else {
                                        setHead(homework.article_id)
                                    }
                                }}
                            >
                                <div className="text-xl font-bold flex-1">
                                    {homework.title}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-row items-center gap-2">
                                        <div className="border-2 border-blue p-2 rounded text-lg font-bold">
                                            {homework.class_.name}
                                        </div>
                                        <div className="border-2 border-green-500 p-2 rounded text-lg font-bold">
                                            {homework.subject.name}
                                        </div>
                                    </div>
                                    <div className="flex justify-end w-full text-gray-600">
                                        마감일: {homework.due_date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {(homeworks.length === 0) && (
                    <div className="flex justify-center items-center w-full h-full text-xl font-bold">
                        숙제가 없습니다.
                    </div>
                )}
            </Scrollbars>
        </div>
    );
}