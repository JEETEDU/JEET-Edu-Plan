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
    const [selectedArticle, setSelectedArticle] = useState<IArticle>({
        attach_files_exist: 0,
        category: 0,
        comment_count: 0,
        content: "게시물을 선택하지 않았습니다.",
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
    });

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
            }
        })();
    }, [selectedClass]);

    const todo = [
        {title: "할 일 목록은 만들기 귀찮아요", done: true, due: "12/31"},
    ];

    const headNotification = {
        content: "1월 10일에 겨울학기가 시작합니다.",
    };

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
                            <div className="flex flex-col gap-5 h-full w-full items-center justify-center">
                                <div className="text-center text-4xl">
                                    {selectedArticle.content}
                                </div>
                                <div>
                                    여기에는 상세 내용이 자세하게 보이게 하고싶다
                                </div>
                            </div>
                        </div>
                        <Scrollbars
                            className="w-full h-full" // bg-gray-100
                            universal
                            autoHide
                        >
                            <div className="p-2 space-y-2">
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