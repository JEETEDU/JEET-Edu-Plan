'use client';

import Scrollbars from "react-custom-scrollbars-2";
import React, {useEffect, useRef, useState} from "react";
import {cn, DELETE, GET, PATCH, POST, PUT} from "@/app/(main)/components/functions";
import Select from "react-select";

import 'react-datepicker/dist/react-datepicker.css';
import {DatepickerWrapper, DateRangePicker} from "@/app/(main)/(links)/home/components/homeworks";
import TextareaAutosize from "react-textarea-autosize";
import DatePicker from "react-datepicker";
import {ko} from "date-fns/locale";

interface INewTodo {
    id: number;
    due_date: Date;
    content: string;
    open: boolean;
}

interface ITodo {
    id: number;
    due_date: string;
    done: number;
    content: string
}

export default function Todo({isMobile = false}: { isMobile?: boolean; }) {
    const [todos, setTodos] = useState<ITodo[]>([]);

    const [page, setPage] = useState<number>(1);

    const [done, setDone] = useState<{ value: string, label: string }>({value: "0", label: "남은 할 일"});
    const today = new Date();
    const [startDueDate, setStartDueDate] = useState<Date | null>(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const [endDueDate, setEndDueDate] = useState<Date | null>(null);
    const [param, setParam] = useState<string>(`page=1&done=0&start_due_date=${parseDate(today)}`);

    function reload(append: boolean = false) {
        (async () => {
            const pageParam = append ? `page=${page}` : "page=1";
            const res: { success: boolean, todos: ITodo[] } = await GET(`/api/user/to_do?${pageParam}${param}`);
            if (res.success) {
                if (append) {
                    setTodos(prev => [...prev, ...(res.todos)]);
                } else {
                    setTodos(res.todos);
                }
            } else {
                setTodos([]);
            }
        })();
    }

    useEffect(() => {
        setPage(1);
        reload();
    }, [param]);

    useEffect(() => {
        if (page > 1) reload(true);
    }, [page]);

    function parseDate(date: Date): string {
        return `${date.getFullYear()}-${(String(date.getMonth() + 1)).padStart(2, '0')}-${(String(date.getDate())).padStart(2, '0')}`;
    }

    useEffect(() => {
        let p = ``;
        if (done.value !== "") p += `&done=${done.value}`;
        if (startDueDate !== null) p += `&start_due_date=${parseDate(startDueDate)}`;
        if (endDueDate !== null) p += `&end_due_date=${parseDate(endDueDate)}`;
        console.log(p);

        setParam(p);
    }, [done, startDueDate, endDueDate]);

    useEffect(() => {
        console.log("Homeworks: ", todos);
    }, [todos]);

    const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);

    const scrollbars = useRef<Scrollbars>(null);

    const [newTodo, setNewTodo] = useState<INewTodo | null>(null);

    return (
        <div className="flex flex-col w-full h-full gap-2">
            <div className="flex flex-col w-full gap-2">
                <div className="grid grid-cols-3 gap-2 items-end">
                    <Select
                        // menuPlacement="top"
                        className={cn("text-center", isMobile ? "text-sm" : "")}
                        components={{
                            IndicatorSeparator: () => null
                        }}
                        options={[
                            {value: "", label: "전체 할 일"},
                            {value: "0", label: "남은 할 일"},
                            {value: "1", label: "끝낸 할 일"},
                        ]}
                        required
                        value={done}
                        instanceId={1}
                        onChange={(e) => setDone(e!)}
                        isSearchable={false}
                    />

                    <div className={cn("flex flex-1 col-span-2", isMobile ? "items-start flex-col" : "gap-2 items-center flex-row")}>
                        <div className={isMobile ? "component-button-info w-full justify-start items-end h-fit" : "flex justify-end items-center"}>
                            마감일로 검색:
                        </div>
                        <div className={cn(" flex flex-row justify-between gap-2 items-center", isMobile ? "w-full" : "flex-1")}>
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
                <div className="w-full flex justify-end">
                    <button
                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:rounded-3xl duration-200 font-bold"
                        onClick={async () => {
                            if (newTodo === null) {
                                setNewTodo({
                                    id: 0,
                                    content: "",
                                    due_date: today,
                                    open: false
                                });
                            } else {
                                if (newTodo.content.trim()) {
                                    if (newTodo.id === 0) {
                                        const res = await POST('/api/user/to_do', {
                                            due_date: parseDate(newTodo.due_date),
                                            content: newTodo.content.trim()
                                        });
                                        if (res.success) {
                                            alert("할 일이 등록되었습니다!");
                                            reload();
                                        }
                                    } else {
                                        const res = await PATCH('/api/user/to_do', {
                                            todo_id: newTodo.id,
                                            due_date: parseDate(newTodo.due_date),
                                            content: newTodo.content.trim()
                                        });
                                        if (res.success) {
                                            alert("할 일이 업데이트 되었습니다!");
                                            reload();
                                        }
                                    }
                                }
                                setNewTodo(null);
                            }
                        }}
                    >
                        {(newTodo) ? "할 일 저장하기" : "할 일 추가하기"}
                    </button>
                </div>
                {(newTodo !== null) && (
                    <div className="bg-white border-2 p-2 rounded w-full flex flex-row gap-2">
                        <div
                            className="flex-1 flex flex-col items-start"
                        >
                            <div className="component-button-info">
                                새로운 할 일
                            </div>
                            <TextareaAutosize
                                className="border-2 p-1 rounded w-full resize-none"
                                onChange={(e) => setNewTodo({
                                    id: newTodo.id,
                                    content: e.target.value,
                                    due_date: newTodo.due_date,
                                    open: newTodo.open
                                })}
                                cacheMeasurements
                                value={newTodo.content}
                            />
                        </div>
                        <div
                            className="flex flex-col items-start cursor-pointer"
                            onClick={() => setNewTodo({
                                id: newTodo.id,
                                content: newTodo.content,
                                due_date: newTodo.due_date,
                                open: true
                            })}
                        >
                            <div
                                className="component-button-info"
                            >
                                마감 기한
                            </div>
                            <div
                                className="border-2 p-1 rounded w-fit whitespace-nowrap"
                            >
                                {parseDate(newTodo.due_date)}
                            </div>
                            {(newTodo.open) && (
                                <div
                                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                                    onClick={() => setNewTodo({
                                        id: newTodo.id,
                                        content: newTodo.content,
                                        due_date: newTodo.due_date,
                                        open: false
                                    })} // 모달 바깥 클릭 시 닫힘
                                >
                                    <div
                                        className="flex flex-col bg-gray-100 gap-4 p-4 rounded items-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="w-full flex items-center justify-center text-center text-xl font-bold">
                                            {newTodo.due_date.toLocaleDateString()}
                                        </div>
                                        <DatepickerWrapper className="w-fit text-center flex gap-4 justify-center">
                                            <DatePicker
                                                className="outline-none"
                                                locale={ko}
                                                selected={newTodo.due_date}
                                                onChange={(e) => {
                                                    setNewTodo({
                                                        id: newTodo.id,
                                                        content: newTodo.content,
                                                        due_date: e || today,
                                                        open: true
                                                    });
                                                }}
                                                dateFormat='yyyy-MM-dd'
                                                placeholderText="전체 기한"
                                                inline
                                                minDate={today}
                                                required
                                            />
                                        </DatepickerWrapper>
                                        <div
                                            className="w-full flex items-center justify-center text-center bg-blue-500 hover:bg-blue-600 text-white py-1 rounded"
                                            onClick={() => setNewTodo({
                                                id: newTodo.id,
                                                content: newTodo.content,
                                                due_date: newTodo.due_date,
                                                open: false
                                            })}
                                        >
                                            저장하기
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
                ref={scrollbars}
                onScrollStop={() => {
                    if (scrollbars.current!.getScrollHeight() - scrollbars.current!.getClientHeight() <= scrollbars.current!.getScrollTop() + 10) {
                        if (todos.length === 10 * page) setPage(p => p + 1);
                    }
                }}
            >
                <div className="flex flex-col w-full gap-2">
                    {todos.map((todo) => (
                        <div
                            key={todo.id}
                            className="flex flex-row w-ful w-full pr-1"
                        >
                            <div
                                className={cn(
                                    "p-2 rounded-l flex items-center justify-center border-2 text-xl cursor-pointer",
                                    (todo.done === 1) ? "bg-green-500 border-green-500 text-white"
                                        : "",
                                    (!isMobile) ? (todo.done === 1) ? "hover:bg-red-500 hover:border-red-500" : "hover:bg-blue hover:border-blue hover:text-white" : ""
                                )}
                                onClick={async () => {
                                    if (todo.done === 0) {
                                        const res = confirm("할 일을 완료하였습니까?");
                                        if (res) {
                                            const r = await PUT('/api/user/to_do/done', {
                                                todo_id: todo.id
                                            });
                                            if (r.success) reload();
                                        }
                                    } else if (todo.done === 1) {
                                        const res = confirm("할 일 완료를 취소하시겠습니까?");
                                        if (res) {
                                            const r = await PUT('/api/user/to_do/undone', {
                                                todo_id: todo.id
                                            });
                                            if (r.success) reload();
                                        }
                                    }
                                }}
                            >
                                {(todo.done === 0) ? (
                                    <div className="i-system-uicons:circle"/>
                                ) : (
                                    <div className="i-system-uicons:check-circle-outside"/>
                                )}
                            </div>
                            <div className={cn("flex-1 border-y-2 border-r-2 rounded-r flex p-2 gap-2 hover:bg-white items-center", isMobile ? "flex-col" : "flex-row")}>
                                <TextareaAutosize
                                    className="text-lg w-full resize-none bg-inherit outline-none"
                                    value={todo.content}
                                    cacheMeasurements
                                    readOnly
                                />
                                <div className={cn("flex flex-row", isMobile ? "w-full justify-between" : "gap-6")}>
                                    <div className="flex flex-row gap-2">
                                        <button
                                            className="p-1 border-2 border-blue rounded hover:bg-blue hover:text-white duration-200"
                                            onClick={() => {
                                                setNewTodo({
                                                    id: todo.id,
                                                    content: todo.content,
                                                    due_date: new Date(todo.due_date),
                                                    open: false
                                                })
                                            }}
                                        >
                                            <div className="i-system-uicons-write"/>
                                        </button>
                                        <button
                                            className="p-1 border-2 border-red rounded hover:bg-red hover:text-white duration-200"
                                            onClick={async () => {
                                                const r = confirm("할 일을 삭제하시겠습니까?");
                                                if (r) {
                                                    const res = await DELETE(`/api/user/to_do?todo_id=${todo.id}`);
                                                    if (res.success) {
                                                        setPage(1);
                                                        reload();
                                                    }
                                                }
                                            }}
                                        >
                                            <div className="i-system-uicons-trash"/>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-end w-full text-gray-600">
                                            마감일: {todo.due_date}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {(todos.length === 0) && (
                    <div className="flex justify-center items-center w-full h-full text-xl font-bold">
                        할 일이 없습니다.
                    </div>
                )}
            </Scrollbars>
        </div>
    );
}