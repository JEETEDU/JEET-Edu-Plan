"use client";

import React, {useEffect, useRef, useState} from "react";
import {cn, getStoreData} from "@/app/(main)/components/functions";
import Link from "next/link";
import Chatting from "@/app/(main)/(links)/board/[id]/mobile";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, loadArticle} from "@/app/(main)/(links)/board/component";
import Select from "react-select";
import {Category, Subject} from "@/app/(main)/(links)/home/(pages)/desktop";

export function ArticleItem({article, head = 0, setHead = null}: { article: IArticle, head?: number | null; setHead?: ((id: number) => void) | null }) {
    return (
        <button
            key={article.id}
            className={cn(
                "p-4 block bg-white rounded-lg border border-gray-200 w-full",
                (article.id === head) ? "border-2 border-black" : " border-2"
            )}
            onClick={() => {
                if (setHead) setHead(article.id);
            }}
        >
            <div className={cn(
                "flex flex-row max-w-full items-center gap-4",
            )}>
                <div className="font-semibold text-gray-800 text-lg text-left flex-grow whitespace-nowrap truncate">
                    {String(article.title)}
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap items-center flex justify-center">
                    {(new Date(article.update_time)).toLocaleString()}
                </div>
            </div>
            <hr className="my-2 border-gray-300"/>
            <div className="flex items-center justify-start gap-2">
                {(article.is_notice === 1) && (
                    <div className="flex flex-col border-2 border-blue p-1 rounded justify-center items-end text-black">
                        공지
                    </div>
                )}
                <Category category={article.category}/>
                <Subject subject={article.subject.name}/>
                <p className="ml-3 text-black flex-1 flex justify-end">
                    {article.user.name} {(article.user.user_type ? article.user.user_type > 1 : false) && "선생님"}
                </p>
            </div>
        </button>
    );
}

export default function Desktop() {
    const [head, setHead] = useState<number>(0);
    const [page, setPage] = useState<number>(1);

    const [articles, setArticles] = useState<IArticle[]>([]);

    interface IClass {
        id: number;
        name: string;
        description: string;
    }

    const [classes, setClasses] = useState<IClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("/로딩중...");

    interface IResponseClasses {
        success: boolean;
        classes: IClass[];
    }

    function reloadClasses() {
        (async () => {
            const resClass: IResponseClasses = (await getStoreData("/api/user/class", 'class-list')).response;
            if (resClass.success) {
                setClasses(resClass.classes);
                const c = resClass.classes[0];
                setSelectedClass(`${c.id}/${c.name} | ${c.description}`);
            }
        })();
    }

    useEffect(() => {
        reloadClasses();
    }, []);

    function reload(append: boolean = false) {
        (async () => {
            const a = await loadArticle(selectedClass, page);
            if (append) {
                setArticles(prev => [...prev, ...a]);
            } else {
                setArticles(a);
                if (a[0]) {
                    setHead(a[0].id || 0);
                } else {
                    setHead(0);
                }
            }
        })();
    }

    useEffect(() => {
        if (page !== 1) reload(true);
    }, [page]);

    useEffect(() => {
        reload();
    }, [selectedClass]);

    const scrollbars = useRef<Scrollbars>(null);

    return (
        <>
            <div className="h-full flex flex-col bg-grap-100">
                <div className="grid grid-cols-3 overflow-hidden flex-grow gap-4 pl-4 pr-3 bg-gray-100">
                    <div className="col-span-2 flex flex-col">
                        <div className="flex-grow w-full">
                            {(head !== 0) && <Chatting id={head} reloadArticlesAction={reload}/>}
                            {(head === 0) && (
                                <div className="w-full h-full bg-gray-100 flex justify-center items-center text-xl font-bold text-gray-700">
                                    게시글을 선택해 주세요
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col bg-gray-100 gap-2">
                        <Scrollbars
                            className="col-span-1 flex-1 grid grid-cols-1"
                            universal
                            autoHide
                            ref={scrollbars}
                            onScroll={() => {
                                if (scrollbars.current!.getScrollHeight() - scrollbars.current!.getClientHeight() <= scrollbars.current!.getScrollTop() + 10) {
                                    if (articles.length === 10 * page) setPage(p => p + 1);
                                }
                            }}
                        >
                            <div className="flex flex-col space-y-2 pr-1 w-full overflow-x-hidden">
                                {articles.map((article: IArticle) => (
                                    <ArticleItem
                                        article={article}
                                        key={article.id}
                                        head={head}
                                        setHead={setHead}
                                    />
                                ))}
                            </div>
                        </Scrollbars>
                    </div>
                </div>

                <div className="bg-gray-100 p-4 grid grid-cols-3 w-full items-center">
                    <Select
                        menuPlacement="top"
                        options={classes.map((c) => {
                            return {label: `${c.name} | ${c.description}`, value: `${c.id}/${c.name} | ${c.description}`};
                        })}
                        required
                        value={{value: selectedClass, label: selectedClass.split('/')[1]}}
                        placeholder="반을 선택해 주세요"
                        instanceId={1}
                        onChange={(e) => setSelectedClass(e?.value ?? "")}
                        isSearchable={false}
                    />

                    <div></div>

                    <div className="flex justify-end">
                        <Link
                            className="bg-white lg:lg:hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5"
                            href={'/board/new'}
                        >
                            게시글 추가하기
                        </Link>
                    </div>
                </div>

            </div>
        </>
    );
}