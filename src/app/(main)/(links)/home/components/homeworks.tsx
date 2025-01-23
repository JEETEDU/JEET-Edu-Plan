'use client';

import Scrollbars from "react-custom-scrollbars-2";
import React, {useEffect, useState} from "react";
import {cn, GET, PUT} from "@/app/(main)/components/functions";
import Select from "react-select";
import DatePicker from "react-datepicker";

import 'react-datepicker/dist/react-datepicker.css';
import {ko} from "date-fns/locale";
import styled from "styled-components";

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

const DatepickerWrapper = styled.div`
.react-datepicker{

    padding : 16px 16px 0 16px;
    
    .react-datepicker__header {
        background-color: #fff;
        color: #fff;
        border-bottom: none;
        border-radius: 0;    
    }

    .react-datepicker__month-container {
        
        padding-bottom : 16px;
        margin-bottom : 8px;

        .react-datepicker__day-names{
            
            width : 280px;
            display : flex;
            justify-content : center;
            align-items : center;
            box-sizing : border-box;
            
            .react-datepicker__day-name{
                display : flex;
                width : 40px;
                height : 40px;
                justify-content : center;
                align-items : center;
            }
        }

        .react-datepicker__month{
            margin : 0px;
        }

        .react-datepicker__week{

            width : 280px;
            display : flex;
            justify-content : space-around;

            > * {
                display : flex;
                width : 40px;
                height : 40px;
                justify-content : center;
                align-items : center;
                color: var(--neutral-dark-medium, #494A50);
                text-align: center;

                font-family: Inter;
                font-size: 12px;
                font-style: normal;
                font-weight: 700;
                line-height: normal;
            }

            .react-datepicker__day--selected{
                border-radius: 20px;
                background: var(--highlight-darkest, #006FFD);
                display: flex;
                width: 40px;
                height: 40px;
                justify-content: center;
                align-items: center;
                color : #fff;
            }
        }
}

.react-datepicker__children-container{
    width : 300px;
    }
}
`

export default function Homeworks({isMobile = false}: { isMobile?: boolean }) {
    const [homeworks, setHomeworks] = useState<IHomework[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [subjects, setSubjects] = useState<ISubject[]>([]);

    const [page, setPage] = useState<number>(1);

    const [done, setDone] = useState<{ value: string, label: string }>({value: "0", label: "남은 숙제"});
    const [class_, setClass] = useState<{ value: string, label: string }>({value: "", label: "전체 반"});
    const [subject, setSubject] = useState<{ value: string, label: string }>({value: "", label: "전체 과목"});
    const [limit, setLimit] = useState<number>(10);
    const today = new Date();
    const [startDueDate, setStartDueDate] = useState<Date | null>(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const [endDueDate, setEndDueDate] = useState<Date | null>(null);
    const [param, setParam] = useState<string>("");

    function reload() {
        (async () => {
            const res: { success: boolean, homeworks: IHomework[] } = await GET(`/api/user/homework?${param}`);
            if (res.success) {
                setHomeworks(res.homeworks);
            } else {
                setHomeworks([]);
            }
        })();
    }

    useEffect(() => {
        if (param !== "") reload();
    }, [param]);

    function parseDate(date: Date): string {
        return `${date.getFullYear()}-${(String(date.getMonth() + 1)).padStart(2, '0')}-${(String(date.getDate())).padStart(2, '0')}`;
    }

    useEffect(() => {
        let p = `page=${page}`;
        if (limit > 0) p += `&limit=${limit}`;
        if (done.value !== "") p += `&done=${done.value}`;
        if (class_.value !== "") p += `&class_id=${class_.value}`;
        if (subject.value !== "") p += `&subject_id=${subject.value}`;
        if (startDueDate !== null) p += `&start_due_date=${parseDate(startDueDate)}`;
        if (endDueDate !== null) p += `&end_due_date=${parseDate(endDueDate)}`;

        setParam(p);
    }, [done, class_, subject, page, limit, startDueDate, endDueDate]);

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

    useEffect(() => {
        console.log("Homeworks: ", homeworks);
    }, [homeworks.length]);

    const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);

    return (
        <div className="flex flex-col w-full h-full gap-4">
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
                        placeholder="반을 선택해 주세요"
                        instanceId={1}
                        onChange={(e) => setDone(e)}
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
                            placeholder="반을 선택해 주세요"
                            instanceId={1}
                            onChange={(e) => setClass(e)}
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
                            placeholder="반을 선택해 주세요"
                            instanceId={1}
                            onChange={(e) => setSubject(e)}
                            isSearchable={false}
                        />
                        <div className="flex flex-col">
                            <div className="component-button-info">
                                한 페이지에 표시할 숙제 수:
                            </div>
                            <input
                                className="w-full py-1 text-center border-2 rounded"
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                            />
                        </div>
                    </>)}
                    <div className="flex flex-col col-span-2">
                        <div className="component-button-info">
                            마감일로 검색:
                        </div>
                        <div className="flex-1 flex flex-row justify-between gap-2 items-center">
                            {(!isMobile) && (<>
                                <DatepickerWrapper className="w-full py-1 text-center border-2 rounded bg-white flex justify-end">
                                    <DatePicker
                                        className="outline-none"
                                        locale={ko}
                                        isClearable
                                        selected={startDueDate}
                                        onChange={(e) => setStartDueDate(e)}
                                        dateFormat='yyyy-MM-dd'
                                        placeholderText="전체 기한"
                                        disabledKeyboardNavigation
                                    />
                                </DatepickerWrapper>
                                <div>
                                    ~
                                </div>
                                <DatepickerWrapper className="w-full py-1 text-center border-2 rounded bg-white flex justify-end">
                                    <DatePicker
                                        className="outline-none"
                                        locale={ko}
                                        isClearable
                                        selected={endDueDate}
                                        onChange={(e) => setEndDueDate(e)}
                                        dateFormat='yyyy-MM-dd'
                                        placeholderText="전체 기한"
                                        disabledKeyboardNavigation
                                    />
                                </DatepickerWrapper>
                            </>)}
                            {isMobile && (
                                <div
                                    className="w-full py-1 justify-center items-center text-center border-2 rounded bg-white flex"
                                    onClick={() => setOpenDatePicker(true)}
                                >
                                    {startDueDate?.toLocaleDateString() || ""} ~ {endDueDate?.toLocaleDateString() || ""}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
            >
                <div className="flex flex-col w-full gap-2">
                    {homeworks.map((homework, index) => (
                        <div
                            key={index}
                            className="flex flex-row w-ful hover:bg-white w-full"
                        >
                            <div
                                className={cn(
                                    "p-2 rounded-l flex items-center justify-center border-2 text-xl cursor-pointer",
                                    (homework.done === 1) ? "bg-green-500 border-green-500 text-white hover:bg-red-500 hover:border-red-500"
                                        : "hover:bg-blue hover:border-blue hover:text-white",
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
                            <div className="h flex-1 border-y-2 border-r-2 rounded-r flex flex-row p-2 gap-2 items-center">
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
            <div className="flex flex-row justify-center items-center text-xl w-full gap-10">
                <div
                    className={cn((page === 1) ? "text-gray" : "")}
                    onClick={() => {
                        if (page > 1) setPage(p => p - 1);
                    }}
                >
                    <div className="i-system-uicons:chevron-left-circle"/>
                </div>
                <div>
                    {page}
                </div>
                <div
                    className={cn((homeworks.length < limit) ? "text-gray" : "")}
                    onClick={() => {
                        if (homeworks.length === limit) setPage(p => p + 1);
                    }}
                >
                    <div className="i-system-uicons:chevron-right-circle"/>
                </div>
            </div>
        </div>
    );
}