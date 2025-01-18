"use client";

import TextareaAutosize from "react-textarea-autosize";
import {ChangeEvent, useEffect, useState} from "react";
import {cn, PATCH} from "@/app/(main)/components/functions";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, IComment, initArticle, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import {Category, Subject} from "@/app/(main)/(links)/home/(pages)/desktop";
import Link from "next/link";

// eslint-disable-next-line @next/next/no-async-client-component
export default function Chatting({id, uid}: { id: number; uid: number }) {
    const [selectedArticle, setSelectedArticle] = useState<IArticle>(initArticle);
    const [comments, setComments] = useState<IComment[]>([]);
    const [editComment, setEditComment] = useState<IComment>();
    const [fileList, setFileList] = useState<File[]>([]);

    function reload() {
        (async () => {
            const articleInfo: {
                article: IArticle,
                comments: IComment[]
            } = await loadArticleInfo(id);

            setSelectedArticle(articleInfo.article);
            setComments(articleInfo.comments);
            setFileList([]);
        })();
    }

    useEffect(() => {
        reload();
    }, [id]);

    const [newComments, setNewComments] = useState<string>("");

    const addComment = () => {
        if (!newComments.trim()) return; // 빈 댓글 방지
        const formData = new FormData();
        formData.append("comment", JSON.stringify({
            article_id: selectedArticle.id,
            content: newComments
        }));
        fileList.map((file: File) => {
            formData.append("files", file);
        })
        fetch('/api/board/comment', {
            method: "POST",
            body: formData
        }).then(r => r.blob()).then(r => {
            console.log(r);
            reload();
        });
        setNewComments(""); // 입력란 초기화
    };

    const [screen, setScreen] = useState(1);

    const fileInput = () => {
        document.getElementById("fileUpload")!.click();
    }

    return (
        <div className="bg-gray-100 px-4 flex flex-col gap-4 h-full">
            {/* Chat Header */}
            <div className={cn(
                "bg-white flex flex-col shadow rounded-lg w-full p-4",
                {"h-full": screen === 2},
                // {"max-h-1/4": screen < 2}
            )}>
                <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 break-all">
                        {selectedArticle.title || ""}
                    </h2>
                    <div className="flex gap-1 w-fit">
                        <button className="i-system-uicons-scale" onClick={() => setScreen(1)}/>
                        <button className="i-system-uicons-scale-contract" onClick={() => setScreen(0)}/>
                        <button className="i-system-uicons-scale-extend" onClick={() => setScreen(2)}/>
                    </div>
                </div>
                {(screen > 0) && (<>
                        <div
                            className={cn(
                                "text-gray-600 break-all",
                                {"grow overflow-y-auto": screen === 2},
                                {"overflow-hidden truncate": screen < 2}
                            )}
                        >
                            {selectedArticle.content}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-4 gap-2">
                            <Category category={selectedArticle.category}/>
                            <Subject subject={selectedArticle.subject.name || ""}/>
                            <div className="flex gap-4 flex-1 justify-end">
                                <span>댓글: {comments.length}</span>
                                <span>마감일: {selectedArticle.due_date}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Comments Section */}
            {screen < 2 && <>
                <div className="flex-1 w-full overflow-hidden flex flex-col">
                    {/*<h3 className="text-lg font-semibold text-gray-800 mb-4">댓글</h3>*/}
                    <Scrollbars
                        className="w-full h-full"
                        universal
                        autoHide
                    >
                        <div className="flex flex-col space-y-2 w-full">
                            {comments.map((comment, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-white border rounded-lg flex flex-col items-center gap-2"
                                >
                                    <div className="flex flex-row justify-between items-center gap-4 w-full text-sm">
                                        <div className={cn(
                                            "p-1 border-2 border-green rounded h-full text-black",
                                            {'bg-green font-bold': (comment.user_id === uid)}
                                        )}>
                                            {comment.user_name}
                                        </div>
                                        <div>
                                            {(comment.user_id === uid) && (
                                                <div className="p-1 border-2 border-blue rounded h-full cursor-pointer hover:bg-blue hover:text-white duration-200">
                                                    <div className="i-system-uicons-write"/>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="whitespace-break-spaces w-full justify-start border rounded p-1">
                                        {comment.content}
                                    </div>
                                    <div className="flex flex-row justify-end items-center gap-4 w-full text-sm">
                                        <Scrollbars
                                            className="flex-1 h-full"
                                            universal
                                            autoHide
                                            autoHeight
                                        >
                                            <div className="flex flex-row gap-2 text-sm mb-2 items-center">
                                                {comment.attach_files.map((file, index) => (
                                                    <Link
                                                        key={index}
                                                        className="flex items-center border rounded whitespace-nowrap p-1"
                                                        href={file.path}
                                                    >
                                                        {file.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </Scrollbars>
                                        <div className="text-gray-600">
                                            {(comment.create_time === comment.update_time) ? (
                                                (new Date(comment.create_time)).toLocaleString()
                                            ) : (
                                                `${(new Date(comment.update_time)).toLocaleString()} 에 업데이트됨`

                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Scrollbars>
                </div>

                <div className="bg-white shadow rounded-lg w-full p-2 space-y-1">
                    {/*<div>*/}
                    <div className="grid grid-cols-2 gap-1" style={{gridTemplateColumns: "1fr auto"}}>
                        <TextareaAutosize
                            cacheMeasurements={true}
                            className="flex-grow overflow-hidden resize-none outline-none"
                            placeholder="댓글을 입력해 주세요"
                            onChange={(e) => {
                                setNewComments(e.target.value)
                            }}
                            value={newComments}
                        />
                        <div
                            className="h-full bg-blue-300 rounded-lg content-center hover:bg-blue-500 p-1"
                            onClick={addComment}
                        >
                            <div className="i-system-uicons-arrow-up-circle"/>
                        </div>
                    </div>
                    <hr/>
                    <div
                        className="grid justify-between w-full items-center h-fit gap-2"
                        style={{gridTemplateColumns: "1fr auto"}}
                    >
                        <Scrollbars
                            className="w-full h-full"
                            universal
                            autoHide
                            autoHeight
                        >
                            <div className="flex flex-row gap-2 text-sm mb-2 items-center">
                                {(fileList.length === 0) && (
                                    <div className="text-gray-500">
                                        {"파일이 선택되지 않았습니다."}
                                    </div>
                                )}
                                {fileList.map((file, index) => (
                                    <div key={index} className="flex items-center border rounded whitespace-nowrap p-1">
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        </Scrollbars>
                        <button
                            className="h-full bg-blue-300 rounded-lg content-center hover:bg-blue-500 p-1"
                            onClick={fileInput}
                        >
                            <div className="i-system-uicons-files-stack"/>
                        </button>
                    </div>
                </div>
                <input
                    type="file"
                    style={{display: "none"}}
                    id="fileUpload"
                    onChange={(e) => {
                        if (e.target.files) {
                            setFileList(Array.from(e.target.files));
                        }
                    }}
                    multiple
                />
            </>}
        </div>
    );
}
