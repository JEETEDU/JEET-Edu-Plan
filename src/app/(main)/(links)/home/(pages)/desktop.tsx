"use client";

import React, {useEffect, useState} from "react";
import {cn, GET} from "@/app/(main)/components/functions";
import Link from "next/link";
import Scrollbars from "react-custom-scrollbars-2";
import Select from "react-select";


export default function Desktop() {
    const [isInfo, setIsInfo] = useState(true);
    const [isTeacher, setIsTeacher] = useState(true);

    interface IArticle {
        id: number;
        title: string;
        content: string;
        create_time: string;
        update_time: string;
        attach_files_exist: number;
        category: number;
        notice: number;
        due_date: string | null;
        comment_count: number;
        user: {
            id: number;
            name: string;
        },
        subject: {
            id: number | null;
            name: string | null;
        }
    }

    const [articles, setArticles] = useState<IArticle[]>([]);
    const initArticle: IArticle = {
        attach_files_exist: 0,
        category: 0,
        comment_count: 0,
        content: "",
        create_time: "",
        due_date: null,
        id: 0,
        notice: 0,
        subject: {
            id: null,
            name: null
        },
        title: "",
        update_time: "",
        user: {
            id: 0,
            name: ""
        }
    }
    const [selectedArticle, setSelectedArticle] = useState<IArticle>(initArticle);

    interface IClass {
        id: number;
        name: string;
        description: string;
    }

    const [classes, setClasses] = useState<IClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");

    useEffect(() => {
        interface IResponseClasses {
            success: boolean;
            classes: IClass[];
        }

        (async () => {
            const resClass: IResponseClasses = await GET('/api/user/class');
            if (resClass.success) {
                setClasses(resClass.classes);
            }
        })();
    }, [])

    useEffect(() => {
        interface IResponseArticles {
            success: boolean;
            articles: IArticle[];
        }

        (async () => {
            if (selectedClass) {
                const resArticle: IResponseArticles = await GET(`/api/board?class_id=${selectedClass.split('/')[0]}`);
                if (resArticle.success) {
                    setArticles(resArticle.articles);
                }
                setSelectedArticle(initArticle);
            }
        })();
    }, [selectedClass]);

    const todo = [
        {title: "할 일 목록은 만들기 귀찮아요", done: true, due: "12/31"},
    ];

    const headNotification = {
        content: "1월 10일에 겨울학기가 시작합니다.",
    };

    function Category({category}: { category: number }) {
        const text = [
            "일반",
            "숙제",
            "질문",
            "Data"
        ]
        const color = [
            "bg-green-500 text-white",
            "bg-red-500 text-white",
            "bg-blue-500 text-white",
            "bg-black text-white",
        ]
        return (
            <div className={cn("p-1 rounded  font-bold text-lg", color[category])}>
                {text[category]}
            </div>
        );
    }

    function Title({title}: { title: string }) {
        return (
            <div className="flex-1 text-2xl">
                {title}
            </div>
        );
    }

    function Time({create_time, update_time}: { create_time: string, update_time: string }) {
        return (
            <div className="flex flex-col text-sm justify-center items-end">
                <div>
                    작성 시간: {create_time}
                </div>
                <div>
                    마지막 업데이트: {update_time}
                </div>
            </div>
        );
    }

    function Subject({subject}: { subject: string }) {
        return (
            <div className="flex flex-col text-lg border-2 border-green p-1 rounded justify-center items-end">
                {subject}
            </div>
        );
    }

    function Hr() {
        return (
            <div className="w-full">
                <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700 w-full"/>
            </div>
        );
    }

    return (
        <>
            <div className="h-full flex flex-col">
                <div className={cn(
                    "text-center text-3xl py-2 bg-gray-100 border-red-600 border-8 h-fit"
                )}>
                    {headNotification.content}
                </div>
                {isInfo ? (
                    <div className="flex-1 grid grid-cols-3 overflow-hidden bg-gray-100"> {/* hear */}
                        <div className="col-span-2 bg-white mt-2 mx-4 rounded-lg border">
                            <div className="flex flex-col gap-4 h-full w-full items-center justify-center p-4">
                                {(selectedArticle.id !== 0) && (
                                    <>
                                        <div className="flex flex-row gap-4 w-full justify-between items-center">
                                            <Subject subject={selectedArticle.subject.name || ""}/>
                                            <Category category={selectedArticle.category}/>
                                            <Title title={selectedArticle.title}/>
                                        </div>
                                        <Hr/>
                                        <div className="text-center text-4xl flex-1 items-center flex">
                                            {selectedArticle.content}
                                        </div>
                                        <Hr/>
                                        <div className="flex flex-row gap-4 w-full justify-end items-center">
                                            <Time create_time={selectedArticle.create_time} update_time={selectedArticle.update_time}/>
                                        </div>
                                    </>
                                )}
                                {(selectedArticle.id === 0) && (
                                    <div className="text-center text-4xl flex-1 items-center flex">
                                        공지가 선택되지 않았습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                        <Scrollbars
                            className="w-full h-full" // bg-gray-100
                            universal
                            autoHide
                        >
                            <div className="p-2 space-y-2 flex flex-col h-full">
                                {articles.map((article) => (
                                    <button
                                        key={article.id}
                                        className="block w-full"
                                        onClick={() => setSelectedArticle(article)}
                                    >
                                        <div className={cn(
                                            "p-3 hover:bg-gray-100 rounded-lg border border-gray-200 w-full",
                                            (selectedArticle && (article.id === selectedArticle.id)) ? "bg-gray-200" : "bg-white"
                                        )}>
                                            {article.title}
                                        </div>
                                    </button>
                                ))}
                                {(selectedClass === "") && (
                                    <div className="w-full flex justify-center h-full items-center">
                                        반이 선택되지 않았습니다.
                                    </div>
                                )}
                                {(selectedClass && articles.length === 0) && (
                                    <div className="w-full flex justify-center h-full items-center">
                                        선택한 반에 공지가 없습니다.
                                    </div>
                                )}
                            </div>
                        </Scrollbars>
                    </div>
                ) : (
                    <div className="flex-1 grid grid-cols-2 overflow-hidden">
                        <div className="overflow-hidden bg-gray-100 flex flex-col px-4 pt-4">
                            <div className="text-center text-2xl mb-4">
                                숙제 목록
                            </div>
                            {/*<Scrollbars*/}
                            {/*    className="w-full h-full"*/}
                            {/*    universal*/}
                            {/*    autoHide*/}
                            {/*>*/}
                            {/*    {notifications.map((notification, index) => (*/}
                            {/*        <Link*/}
                            {/*            key={index}*/}
                            {/*            className="block w-full"*/}
                            {/*            href={'/'}*/}
                            {/*        >*/}
                            {/*            <div className={cn(*/}
                            {/*                "p-3 mb-2 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 w-full",*/}
                            {/*                "bg-white"*/}
                            {/*            )}>*/}
                            {/*                {notification}*/}
                            {/*            </div>*/}
                            {/*        </Link>*/}
                            {/*    ))}*/}
                            {/*</Scrollbars>*/}
                        </div>
                        <div className="overflow-hidden pt-4 px-4 bg-gray-100 flex flex-col">
                            <div className="text-center text-2xl mb-4">
                                내 할일 목록
                            </div>
                            {/*<Scrollbars*/}
                            {/*    className="w-full h-full"*/}
                            {/*    universal*/}
                            {/*    autoHide*/}
                            {/*>*/}
                            {/*    {notifications.map((notification, index) => (*/}
                            {/*        <Link*/}
                            {/*            key={index}*/}
                            {/*            className="block w-full"*/}
                            {/*            href={'/'}*/}
                            {/*        >*/}
                            {/*            <div className={cn(*/}
                            {/*                "p-3 mb-2 hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 w-full",*/}
                            {/*                "bg-white"*/}
                            {/*            )}>*/}
                            {/*                {notification}*/}
                            {/*            </div>*/}
                            {/*        </Link>*/}
                            {/*    ))}*/}
                            {/*</Scrollbars>*/}
                        </div>
                    </div>
                )}
                <div className="bg-gray-100 p-4 grid grid-cols-3 w-full items-center">
                    {isInfo && (
                        <Select
                            menuPlacement="top"
                            options={classes.map((c, i) => {
                                return {label: `${c.name} | ${c.description}`, value: `${c.id}/${i}`};
                            })}
                            required
                            instanceId={1}
                            onChange={(e) => setSelectedClass(e.value)}
                        />
                    )}
                    {!isInfo && (<div></div>)}

                    <div className="flex justify-center">
                        <div className="p-0 rounded-2xl shadow-2xl pointer-events-auto grid grid-cols-2 component-form">
                            <button
                                className={cn(
                                    {
                                        "bg-white pointer-events-none": isInfo,
                                        "bg-gray-300 hover:bg-gray-200 transition duration-200": !isInfo,
                                    },
                                    "h-fit rounded-l-lg text-center p-2"
                                )}
                                onClick={() => setIsInfo(!isInfo)}
                            >
                                학원 공지사항
                            </button>
                            <button
                                className={cn(
                                    {
                                        "bg-white pointer-events-none": !isInfo,
                                        "bg-gray-300 hover:bg-gray-200 transition duration-200": isInfo,
                                    },
                                    "h-fit rounded-r-lg text-center p-2"
                                )}
                                onClick={() => setIsInfo(!isInfo)}
                            >
                                할 일 목록
                            </button>
                        </div>
                    </div>

                    {!isInfo && (
                        <div className="flex justify-end">
                            <button
                                className="bg-white hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5"
                                onClick={() => setIsTeacher(!isTeacher)}
                            >
                                내 할일 추가하기
                            </button>
                        </div>
                    )}
                    {isInfo && (
                        <div className="flex justify-start">
                            <Link
                                className="bg-white hover:bg-gray-200 transition duration-200 h-fit rounded-lg text-center py-2 px-5"
                                // onClick={() => setIsTeacher(!isTeacher)}
                                href={'/home/new'}
                            >
                                공지 추가하기
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}