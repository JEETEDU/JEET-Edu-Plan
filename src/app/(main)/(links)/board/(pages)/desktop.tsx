"use client";

import React, {useEffect, useState} from "react";
import {cn, getStoreData} from "@/app/(main)/components/functions";
import Link from "next/link";
import Chatting from "@/app/(main)/(links)/board/[id]/mobile";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, loadArticle} from "@/app/(main)/(links)/board/component";
import Select from "react-select";
import {Category, Subject} from "@/app/(main)/(links)/home/(pages)/desktop";

export function ArticleItem({article, head = 0, setHead = null}: { article: IArticle, head?: number | null; setHead?: ((id: number) => void) | null }) {
    // console.log(article)
    return (
        <button
            key={article.id}
            className={cn(
                "p-4 block bg-white rounded-lg border border-gray-200 w-full",
                (article.id === head) ? "border-2 border-black" : ""
            )}
            onClick={() => {
                if (setHead) setHead(article.id);
            }}
        >
            <div className={cn(
                "flex justify-between items-center",
            )}>
                <span className="font-semibold text-gray-800 text-lg">{article.title}</span>
                <span className="text-sm text-gray-500">{(new Date(article.update_time)).toLocaleString()}</span>
            </div>
            <hr className="my-2 border-gray-300"/>
            <div className="flex items-center justify-start gap-2">
                <Category category={article.category}/>
                <Subject subject={article.subject.name}/>
                <p className="ml-3 text-black flex-1 flex justify-end">
                    {article.user.name} {(article.user.user_type > 1) && "선생님"}
                </p>
            </div>
        </button>
    );
}

export default function Desktop() {
    const [head, setHead] = useState<number>(0);
    // const [userType, setUserType] = useState(0);

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
                console.log(resClass.classes)
                setSelectedClass(`${c.id}/${c.name} | ${c.description}`);
            }
        })();
    }

    useEffect(() => {
        reloadClasses();
    }, []);

    useEffect(() => {
        (async () => {
            const a = await loadArticle(selectedClass);
            setArticles(a);
            if (a[0]) {
                setHead(a[0].id || 0);
            } else {
                setHead(0);
            }
        })();
    }, [selectedClass]);


    return (
        <>
            <div className="h-full flex flex-col bg-grap-100">
                <div className="grid grid-cols-3 overflow-hidden flex-grow gap-4 px-4 bg-gray-100">
                    <div className="col-span-2 flex flex-col">
                        <div className="flex-grow w-full">
                            {(head !== 0) && <Chatting id={head}/>}
                            {(head === 0) && (
                                <div className="w-full h-full bg-gray-100 flex justify-center items-center text-xl font-bold text-gray-700">
                                    게시글을 선택해 주세요
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex-grow bg-gray-100">
                        <Scrollbars
                            className="w-full h-full"
                            universal
                            autoHide
                        >
                            <div className="flex flex-col space-y-2">
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
                        onChange={(e) => setSelectedClass(e.value)}
                        isSearchable={false}
                    />

                    <div></div>

                    <div className="flex justify-end">
                        <Link
                            className="bg-white hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5"
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