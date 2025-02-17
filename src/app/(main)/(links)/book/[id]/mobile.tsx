'use client';

import React, {useEffect, useState} from "react";
import {cn, DELETE, GET, POST, PUT} from "@/app/(main)/components/functions";
import Scrollbars from "react-custom-scrollbars-2";
import TextareaAutosize from "react-textarea-autosize";

export interface IBook {
    id: number;
    title: string;
    user_id?: number;
    content: string;
    author: string;
    publisher: string;
    update_time: string;
}

export const defaultBook: IBook = {
    author: "",
    content: "",
    id: 0,
    publisher: "",
    title: "",
    user_id: 0,
    update_time: "",
};

interface IParams {
    id: number;
    setCountAction?: (f: (h: number) => number) => void;
    setHeadAction?: (h: number) => void;
}

export default function BookReport({id = 0, setCountAction = () => void null, setHeadAction = () => void null}: IParams) {
    const [book, setBook] = useState<IBook>(defaultBook);
    const [error, setError] = useState<string>("");
    const [edit, setEdit] = useState<boolean>(false);

    useEffect(() => {
        if (id !== 0) {
            setEdit(false);
            (async () => {
                const res: { success: boolean; book: IBook } = await GET(`/api/user/book/${id}`);
                if (res.success) setBook(res.book);
            })();
        } else {
            setEdit(true)
            setBook(defaultBook);
        }
    }, [id])

    async function save() {
        if (!book.title.trim()) {
            setError("제목을 입력해 주세요");
            return {success: false};
        }
        if (!book.content.trim()) {
            setError("내용을 입력해 주세요");
            return {success: false};
        }
        if (!book.author.trim()) {
            setError("저자를 입력해 주세요");
            return {success: false};
        }
        if (!book.publisher.trim()) {
            setError("출판사를 입력해 주세요");
            return {success: false};
        }

        if (id === 0) return await POST('/api/user/book', book);
        else return await PUT('/api/user/book', book);
    }

    async function delete_() {
        if (id !== 0) {
            if (confirm("독서록을 삭제하시겠습니까?")) return await DELETE('/api/user/book', {
                book_id: book.id
            });
        } else return {success: true};
    }

    return (!book) ? (
        <div className="text-3xl font-bold w-full h-full flex justify-center items-center">
            로딩중...
        </div>
    ) : (
        <div className="flex flex-col space-y-1 border-2 h-full w-full rounded p-2">
            <div className="flex flex-row w-full justify-between items-end">
                <div className="col-span-4 text-gray-600 pl-2">
                    책 제목
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <div className="text-red-600 text-sm">
                        {error}
                    </div>
                    <div
                        className={cn("p-1 border-2 border-blue rounded  cursor-pointer", edit ? "md:hover:bg-white md:hover:text-black bg-blue text-white" : "md:hover:bg-blue md:hover:text-white")}
                        onClick={() => {
                            if (edit) {
                                save().then(r => {
                                    if (r.success) {
                                        alert(`독서록이 ${(id === 0) ? "저장" : "업데이트"} 되었습니다!`);
                                        setCountAction(c => c + 1);
                                        setEdit(false);
                                    }
                                });
                            } else setEdit(true);
                        }}
                    >
                        <div className={cn(edit ? "i-system-uicons:clipboard-check" : "i-system-uicons-write")}/>
                    </div>
                    <div
                        className="p-1 border-2 border-red rounded md:hover:bg-red md:hover:text-white  cursor-pointer"
                        onClick={() => {
                            delete_().then(r => {
                                if (r.success) {
                                    alert('독서록이 삭제 되었습니다!');
                                    setHeadAction(0);
                                    setCountAction(c => c + 1);
                                }
                            });
                        }}
                    >
                        <div className="i-system-uicons-trash"/>
                    </div>
                </div>
            </div>
            <input
                className={cn("col-span-4 font-bold text-2xl rounded px-1", edit ? "bg-white" : "bg-inherit outline-none")}
                value={book.title}
                onChange={(e) => setBook(prev => {
                    setError("");
                    const obj = {...prev};
                    obj.title = e.target.value;
                    return obj;
                })}
                readOnly={!edit}
            />
            <div className="w-full gap-4 justify-end items-center grid grid-cols-3">
                <div className="flex flex-row gap-2 items-center col-span-2 justify-end">
                    <div className="flex-1">
                        <input
                            className={cn("w-full text-end px-1 rounded", edit ? "bg-white" : "bg-inherit outline-none")}
                            value={book.publisher}
                            onChange={(e) => setBook(prev => {
                                setError("");
                                const obj = {...prev};
                                obj.publisher = e.target.value;
                                return obj;
                            })}
                            readOnly={!edit}
                        />
                    </div>
                    <div className="text-gray-600 whitespace-nowrap text-sm">
                        출판
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center justify-end">
                    <div className="flex-1">
                        <input
                            className={cn("w-full text-end px-1 rounded", edit ? "bg-white" : "bg-inherit outline-none")}
                            value={book.author}
                            onChange={(e) => setBook(prev => {
                                setError("");
                                const obj = {...prev};
                                obj.author = e.target.value;
                                return obj;
                            })}
                            readOnly={!edit}
                        />
                    </div>
                    <div className="text-gray-600 text-sm">
                        저
                    </div>
                </div>
            </div>
            <hr className="h-2px bg-gray-200 border-0 w-full"/>
            <Scrollbars
                className="flex-1"
                universal
                autoHide
            >
                <TextareaAutosize
                    className={cn("w-full break-all resize-none outline-none min-h-full px-1", edit ? "bg-white" : "bg-inherit")}
                    value={book.content}
                    onChange={(e) => setBook(prev => {
                        setError("");
                        const obj = {...prev};
                        obj.content = e.target.value;
                        return obj;
                    })}
                    readOnly={!edit}
                />
            </Scrollbars>
            <hr className="h-2px bg-gray-200 border-0  w-full"/>
            <div className="flex w-full justify-end text-gray-600">
                {(new Date(book.update_time)).toLocaleString()} 에 편집됨
            </div>
        </div>
    )
}