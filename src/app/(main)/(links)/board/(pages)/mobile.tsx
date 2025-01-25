"use client";

import React, {useEffect, useRef, useState} from "react";
import {cn, GET, getStoreData} from "@/app/(main)/components/functions";
import Link from "next/link";
import {IArticle, loadArticle} from "@/app/(main)/(links)/board/component";
import Scrollbars from "react-custom-scrollbars-2";
import {Category, Subject} from "@/app/(main)/(links)/home/(pages)/desktop";
import Select from "react-select";

// 더 할 작업
// 1. 공지사항은 종류에 따라 색으로 구분, 기한 표시 등등
// 3. 디자인 좀 수정해야됨...(그림자 빼기 등)

export default function Mobile() {
    const [articles, setArticles] = useState<IArticle[]>([]);

    const [page, setPage] = useState<number>(1);

    interface IClass {
        id: number;
        name: string;
        description: string;
    }

    const [classes, setClasses] = useState<IClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("/로딩중...");

    useEffect(() => {
        interface IResponseClasses {
            success: boolean;
            classes: IClass[];
        }

        (async () => {
            const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;

            if (userInfo.user_type === 1) {
                const classList = (await getStoreData("/api/user/class", 'class-list')).response.classes;
                setClasses(classList);
            } else if (userInfo.user_type >= 2) {
                const classList = (await getStoreData("/api/user/class", 'class-list')).response.classes;
                setClasses(classList);
            }

            const resClass: IResponseClasses = await GET('/api/user/class');
            if (resClass.success) {
                setClasses(resClass.classes);
                const c = resClass.classes[0];
                setSelectedClass(`${c.id}/${c.name} | ${c.description}`);
            }
        })();
    }, []);

    function reload(append: boolean = false) {
        (async () => {
            const a = await loadArticle(selectedClass, page);
            if (append) {
                setArticles(prev => [...prev, ...a]);
            } else {
                setArticles(a);
            }
        })();
    }

    useEffect(() => {
        reload();
    }, [selectedClass]);

    useEffect(() => {
        if (page !== 1) reload(true);
    }, [page]);

    const scrollbars = useRef<Scrollbars>(null);

    return (
        <div className="flex flex-col h-full bg-gray-100 gap-2">
            <Select
                className="mx-4"
                menuPlacement="top"
                options={classes.map((c) => {
                    return {label: `${c.name} | ${c.description}`, value: `${c.id}/${c.name} | ${c.description}`};
                })}
                required
                value={{value: selectedClass, label: selectedClass.split('/')[1]}}
                placeholder="반을 선택해 주세요"
                instanceId={1}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                onChange={(e) => setSelectedClass(e.value)}
                isSearchable={false}
            />
            <div className="flex-grow bg-gray-100">
                <Scrollbars
                    className="w-full h-full"
                    universal
                    autoHide
                    ref={scrollbars}
                    onScroll={() => {
                        if (scrollbars.current!.getScrollHeight() - scrollbars.current!.getClientHeight() <= scrollbars.current!.getScrollTop() + 10) {
                            if (articles.length === 10 * page) setPage(p => p + 1);
                        }
                    }}
                >
                    <div className="px-4">
                        {articles.map((article: IArticle) => (
                            <Link
                                key={article.id}
                                className="p-2 block mb-2 bg-white rounded border border-gray-200 w-full"
                                href={`/board/${article.id}`}
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <div className="font-semibold text-gray-800 text-lg whitespace-nowrap truncate">
                                        {article.title}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-sm text-gray-500 whitespace-nowrap">
                                            {article.update_time.split(' ')[0]}
                                        </div>
                                        <div className="text-sm text-gray-500 whitespace-nowrap">
                                            {article.update_time.split(' ')[1]}
                                        </div>
                                    </div>
                                </div>
                                <hr className="my-2 border-gray-300"/>
                                <div className="flex items-center justify-between gap-2">
                                    {(article.is_notice === 1) && (
                                        <div className="flex flex-col border-2 border-blue p-1 rounded justify-center items-end text-black">
                                            공지
                                        </div>
                                    )}
                                    <Category category={article.category}/>
                                    <Subject subject={article.subject.name}/>
                                    <p className="ml-3 text-black flex-1 flex justify-end">
                                        {article.user.name}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Scrollbars>
            </div>
        </div>
    );
}
