'use client';

import React, {Fragment, useEffect, useState} from "react";
import {GET} from "@/app/(main)/components/functions";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";
import Scrollbars from "react-custom-scrollbars-2";
import TextareaAutosize from "react-textarea-autosize";
import Link from "next/link";

interface IBook {
    id: number;
    title: string;
    user_id: number;
    content: string;
    author: string;
    publisher: string;
}

export default function BookReport({id}: { id: number }) {
    const [book, setBook] = useState<IBook>({
        author: "",
        content: "",
        id: 0,
        publisher: "",
        title: "",
        user_id: 0
    });

    useEffect(() => {
        (async () => {
            const res: { success: boolean; book: IBook } = await GET(`/api/user/book/${id}`);
            if (res.success) setBook(res.book);
        })();
    }, [id])

    return (id === 0) ? (
        <div className="text-3xl font-bold w-full h-full flex justify-center items-center">
            로딩중...
        </div>
    ) : (
        <div className="flex flex-col space-y-2 border-2 h-full w-full rounded p-2">
            <div className="flex flex-row w-full justify-between items-start">
                <div className="flex flex-col">
                    <div className="col-span-4 text-gray-600">
                        책 제목
                    </div>
                    <div className="col-span-4 font-bold text-2xl">
                        {book?.title}
                    </div>
                </div>
                <div className="flex flex-row gap-2">
                    <div
                        className="p-1 border-2 border-blue rounded lg:lg:hover:bg-blue lg:lg:hover:text-white duration-200"
                    >
                        <div className="i-system-uicons-write"/>
                    </div>
                    <div
                        className="p-1 border-2 border-red rounded lg:lg:hover:bg-red lg:lg:hover:text-white duration-200"
                    >
                        <div className="i-system-uicons-trash"/>
                    </div>
                </div>
            </div>
            <div className="flex w-full flex-row gap-4 justify-end items-center">
                <div className="flex flex-row gap-2 items-center">
                    <div className="text-lg">
                        {book?.publisher}
                    </div>
                    <div className="text-gray-600">
                        출판
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <div className="text-lg">
                        {book?.author}
                    </div>
                    <div className="text-gray-600">
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
                    className="w-full break-all resize-none outline-none"
                    style={{background: "inherit"}}
                    value={book?.content}
                    readOnly
                />
            </Scrollbars>
        </div>
    )
}