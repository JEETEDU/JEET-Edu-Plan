'use client';

import {cn, GET} from "@/app/(main)/components/functions";
import Scrollbars from "react-custom-scrollbars-2";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";

interface IBook {
    id: number;
    title: string;
    author: string;
    publisher: string;
    content: string;
}

export default function BookList({isMobile = false, setHeadAction = () => void null}: { isMobile?: boolean; setHeadAction?: (h: number) => void }) {
    const [books, setBooks] = useState<IBook[]>([]);
    const [search, setSearch] = useState<string>('');
    const [focusOnSearch, setFocusOnSearch] = useState<boolean>(false);
    const [head, setHead] = useState<number>(0);
    const [page, setPage] = useState<number>(1);

    const scrollbars = useRef<Scrollbars>(null);

    function reload(append: boolean = false) {
        (async () => {
            const res: { success: boolean; books: IBook[] } = await GET(`/api/user/book?title=${search}&offset=${(page - 1) * 10}`);
            if (res.success) {
                if (append) setBooks((prev) => [...prev, ...res.books]);
                else {
                    setBooks(res.books);
                    if ((res.books.length > 0) && (!isMobile)) setHead(res.books[0].id);
                }
            }
        })();
    }

    useEffect(() => {
        setPage(1);
        reload();
    }, [search,]);

    useEffect(() => {
        if (page > 1) reload(true);
    }, [page]);

    const router = useRouter();

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
                <div
                    className={cn(
                        "border-2 py-1 px-3 flex h-fit rounded justify-between items-center gap-3 bg-white flex-1 h-full",
                        {"border-black": focusOnSearch}
                    )}
                    onFocus={() => setFocusOnSearch(true)}
                    onBlur={() => setFocusOnSearch(false)}
                >
                    <input
                        className="flex-1 outline-none bg-white"
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    />
                    <button
                        className="i-heroicons-outline-search"
                        onClick={() => reload()}
                    />
                </div>
                <div className="component-button">
                    독서록 추가하기
                </div>
            </div>

            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
                ref={scrollbars}
                onScrollStop={() => {
                    if (scrollbars.current!.getScrollHeight() - scrollbars.current!.getClientHeight() <= scrollbars.current!.getScrollTop() + 10) {
                        if (books.length === 10 * page) setPage(p => p + 1);
                    }
                }}
            >
                <div className="flex flex-col w-full gap-2">
                    {books.map((book, index) => (
                        <div
                            key={index}
                            className="flex flex-row w-full pr-1"
                        >
                            <div
                                className={cn("h flex-1 border-2 rounded flex flex-row p-2 gap-2 hover:bg-white items-center justify-between", {"border-black": (book.id === head)})}
                                onClick={() => {
                                    if (isMobile) {
                                        router.push(`/book/${book.id}`)
                                    } else {
                                        setHead(book.id)
                                    }
                                }}
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
                        </div>
                    ))}
                </div>
            </Scrollbars>
        </div>
    )
}