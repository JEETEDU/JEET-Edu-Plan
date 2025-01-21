"use client";

import React, {useEffect, useState} from "react";
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

    useEffect(() => {
        (async () => {
            const a = await loadArticle(selectedClass);
            setArticles(a);
        })();
    }, [selectedClass]);

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
                onChange={(e) => setSelectedClass(e.value)}
                isSearchable={false}
            />
            <div className="flex-grow bg-gray-100">
                <Scrollbars
                    className="w-full h-full"
                    universal
                    autoHide
                >
                    <div className="px-4">
                        {articles.map((article: IArticle) => (
                            <Link
                                key={article.id}
                                className="p-4 block mb-2 bg-white rounded-lg border border-gray-200 w-full"
                                href={`/board/${article.id}`}
                            >
                                <div className={cn(
                                    "flex justify-between items-center",
                                )}>
                                    <span className="font-semibold text-gray-800 text-lg">{article.title}</span>
                                    <span className="text-sm text-gray-500">{article.update_time}</span>
                                </div>
                                <hr className="my-2 border-gray-300"/>
                                <div className="flex items-center justify-between gap-2">
                                    <Category category={article.category}/>
                                    <Subject subject={article.subject.name}/>
                                    <p className="ml-3 text-gray-500 flex-1 flex justify-end">
                                        여기엔 뭐넣지
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
