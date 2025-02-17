'use client';

import React, {useEffect, useState} from "react";
import {cn, GET} from "@/app/(main)/components/functions";
import {defaultBook, IBook} from "@/app/(main)/(links)/book/[id]/mobile";
import Scrollbars from "react-custom-scrollbars-2";
import TextareaAutosize from "react-textarea-autosize";
import {IUserInfo} from "@/app/(main)/(links)/mypage/(pages)/component/userList/userDetail";

function BookItem({book, userInfo}: { book: IBook; userInfo: IUserInfo }) {
    const [show, setShow] = useState<boolean>(false);
    return (
        <>
            <div
                className={cn(
                    "border-2 rounded flex w-full justify-between p-2 cursor-pointer md:hover:bg-white",
                    {"invisible pointer-events-none": book.id === 0}
                )}
                onClick={() => setShow(true)}
            >
                <div className="flex flex-col">
                    <div className="text-xl font-bold flex-1">
                        {book.title}
                    </div>
                    <div className="text-sm text-gray-500">
                        {book.publisher} | {book.author}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div>
                        작성 날짜
                    </div>
                    <div>
                        수정 날짜
                    </div>
                </div>
            </div>
            {(show) && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
                    onClick={() => setShow(false)} // 모달 바깥 클릭 시 닫힘
                >
                    <div
                        className={cn("bg-gray-100 rounded-lg shadow-lg p-4 flex flex-col justify-between gap-4 w-9/10 h-9/10 z-15")}
                        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                    >
                        <div className="flex flex-col space-y-1 border-2 h-full w-full rounded p-2">
                            <div className="flex flex-row w-full justify-between items-end">
                                <div className="col-span-4 text-gray-600 pl-2">
                                    책 제목
                                </div>
                                <div>
                                    {userInfo.school} | {userInfo.first_year} | {userInfo.joined_term} | {userInfo.name}
                                </div>
                            </div>
                            <input
                                className={cn("col-span-4 font-bold text-2xl rounded px-1 bg-inherit outline-none")}
                                value={book.title}
                                readOnly
                            />
                            <div className="w-full gap-4 justify-end items-center grid grid-cols-3">
                                <div className="flex flex-row gap-2 items-center col-span-2 justify-end">
                                    <div className="flex-1">
                                        <input
                                            className={cn("w-full text-end px-1 rounded bg-inherit outline-none")}
                                            value={book.publisher}
                                            readOnly
                                        />
                                    </div>
                                    <div className="text-gray-600 whitespace-nowrap text-sm">
                                        출판
                                    </div>
                                </div>
                                <div className="flex flex-row gap-2 items-center justify-end">
                                    <div className="flex-1">
                                        <input
                                            className={cn("w-full text-end px-1 rounded bg-inherit outline-none")}
                                            value={book.author}
                                            readOnly
                                        />
                                    </div>
                                    <div className="text-gray-600 text-sm">
                                        저
                                    </div>
                                </div>
                            </div>
                            <hr className="h-2px bg-gray-200 border-0  w-full"/>
                            <Scrollbars
                                className="flex-1"
                                universal
                                autoHide
                            >
                                <TextareaAutosize
                                    className={cn("w-full break-all resize-none outline-none min-h-full px-1 bg-inherit")}
                                    value={book.content}
                                    readOnly
                                />
                            </Scrollbars>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default function BookReport({uid, userInfo}: { uid: number; userInfo: IUserInfo }) {
    const [books, setBooks] = useState<IBook[]>([]);
    const [nextBooks, setNextBooks] = useState<IBook[]>([]);
    const [prevBooks, setPrevBooks] = useState<IBook[]>([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState<string>("");
    const [focusOnSearch, setFocusOnSearch] = useState<boolean>(false);
    const limit = 10;

    async function getBooks(offset: number): Promise<IBook[]> {
        const res: {
            success: boolean;
            books: IBook[];
        } = await GET(`/api/admin/user/book?user_id=${uid}&offset=${offset}&limit=${limit}`);
        if (res.success) {
            return res.books;
        } else {
            return [];
        }
    }

    async function nextPage() {
        const _page = page;
        setPage(p => p + 1);
        setPrevBooks(books);
        setBooks(nextBooks);
        setNextBooks(await getBooks((_page + 1) * limit));
    }

    async function prevPage() {
        const _page = page;
        setNextBooks(books);
        setBooks(prevBooks);
        setPage(p => p - 1);
        setPrevBooks((_page === 2) ? [] : await getBooks((_page - 3) * limit));
    }

    function reload() {
        (async () => {
            const res: {
                success: boolean;
                books: IBook[];
            } = await GET(`/api/admin/user/book?user_id=${uid}&limit=${limit}&title=${search}`);
            if (res.success) {
                setBooks(res.books);
            }

            const nextRes: {
                success: boolean;
                books: IBook[];
            } = await GET(`/api/admin/user/book?user_id=${uid}&offset=${limit}&limit=${limit}&title=${search}`);
            if (nextRes.success) {
                setNextBooks(nextRes.books);
            }
        })();
    }

    useEffect(() => {
        setPage(1);
        reload();
    }, [uid, search])


    return (
        <div className="flex flex-col justify-between items-center space-y-4">
            <div className="text-2xl text-gray-800 font-semibold w-full">
                독서록
            </div>
            <div className="flex items-center w-full justify-between gap-4">
                <div
                    className={cn(
                        "border-2 py-1 px-3 flex rounded justify-between items-center gap-3 bg-white flex-1 h-full",
                        {"border-black": focusOnSearch}
                    )}
                    onFocus={() => setFocusOnSearch(true)}
                    onBlur={() => setFocusOnSearch(false)}
                >
                    <input
                        className="flex-1 outline-none bg-white"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    />
                    <button
                        className="i-heroicons-outline-search"
                        onClick={() => reload()}
                    />
                </div>
                <div className="grid grid-cols-3 gap-2 items-center text-lg">
                    <div
                        className={cn(
                            "flex p-1 border-2 border-gray-300 justify-center rounded",
                            (page === 1) ? "bg-gray-300 text-gray pointer-events-none" : "cursor-pointer md:hover:bg-white md:hover:border-gray "
                        )}
                        onClick={() => prevPage()}
                    >
                        <div className="i-system-uicons:arrow-left-circle"/>
                    </div>
                    <div className="flex justify-center items-center">
                        {page}
                    </div>
                    <div
                        className={cn(
                            "flex p-1 border-2 border-gray-300 justify-center rounded",
                            (nextBooks.length === 0) ? "bg-gray-300 text-gray pointer-events-none" : "cursor-pointer md:hover:bg-white md:hover:border-gray "
                        )}
                        onClick={() => nextPage()}
                    >
                        <div className="i-system-uicons:arrow-right-circle"/>
                    </div>
                </div>
            </div>
            {
                (books.length === 0) ? (
                    <div className="text-3xl font-bold w-full h-full flex justify-center items-center">
                        독서록이 없습니다.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 w-full gap-2 items-end justify-between">
                        {books.map(book => <BookItem key={book.id} book={book} userInfo={userInfo}/>)}
                        {Array.from({length: limit - books.length, 0: 1}).map((_, i) => <BookItem book={defaultBook} key={`i${i}`} userInfo={userInfo}/>)}
                    </div>
                )
            }
        </div>
    );
}