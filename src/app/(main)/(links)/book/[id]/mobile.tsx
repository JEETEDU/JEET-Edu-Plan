'use client';

import React, {useEffect, useState} from "react";
import {cn, DELETE, GET, PUT} from "@/app/(main)/components/functions";
import Scrollbars from "react-custom-scrollbars-2";
import TextareaAutosize from "react-textarea-autosize";
import {useRouter} from "next/navigation";

interface IBook {
    id: number;
    title: string;
    user_id: number;
    content: string;
    author: string;
    publisher: string;
}

export default function BookReport({id = 0, setHeadAction = () => void null}: { id: number; setHeadAction?: (h: number) => void }) {
    const [book, setBook] = useState<IBook>({
        author: "",
        content: "",
        id: 0,
        publisher: "",
        title: "",
        user_id: 0
    });

    const [edit, setEdit] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const res: { success: boolean; book: IBook } = await GET(`/api/user/book/${id}`);
            if (res.success) setBook(res.book);
        })();
    }, [id])

    async function update() {
        return await PUT('/api/user/book', book);
    }

    async function delete_() {
        if (confirm("독서록을 삭제하시겠습니까?")) return await DELETE('/api/user/book', {
            book_id: book.id
        });
    }

    const router = useRouter();

    return (id === 0) ? (
        <div className="text-3xl font-bold w-full h-full flex justify-center items-center">
            로딩중...
        </div>
    ) : (
        <div className="flex flex-col space-y-1 border-2 h-full w-full rounded p-2">
            <div className="flex flex-row w-full justify-between items-end">
                <div className="col-span-4 text-gray-600 pl-2">
                    책 제목
                </div>
                <div className="flex flex-row gap-2">
                    <div
                        className={cn("p-1 border-2 border-blue rounded duration-200", edit ? "lg:hover:bg-white lg:hover:text-black bg-blue text-white" : "lg:hover:bg-blue lg:hover:text-white")}
                        onClick={() => {
                            if (edit) {
                                update().then(r => {
                                    if (r.success) alert('독서록이 업데이트 되었습니다!');
                                });
                            }
                            setEdit(e => !e);
                        }}
                    >
                        <div className={cn(edit ? "i-system-uicons:clipboard-check" : "i-system-uicons-write")}/>
                    </div>
                    <div
                        className="p-1 border-2 border-red rounded lg:hover:bg-red lg:hover:text-white duration-200"
                        onClick={() => {
                            delete_().then(r => {
                                if (r.success) {
                                    alert('독서록이 삭제 되었습니다!');
                                    setHeadAction(0);
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
                value={book?.title}
                onChange={(e) => setBook(prev => {
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
                            value={book?.publisher}
                            onChange={(e) => setBook(prev => {
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
                            value={book?.author}
                            onChange={(e) => setBook(prev => {
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
            <hr className="h-2px bg-gray-200 border-0 dark:bg-gray-700 w-full"/>
            <Scrollbars
                className="flex-1"
                universal
                autoHide
            >
                <TextareaAutosize
                    className={cn("w-full break-all resize-none outline-none px-1", edit ? "bg-white" : "bg-inherit")}
                    value={book?.content}
                    onChange={(e) => setBook(prev => {
                        const obj = {...prev};
                        obj.content = e.target.value;
                        return obj;
                    })}
                    readOnly={!edit}
                />
            </Scrollbars>
        </div>
    )
}