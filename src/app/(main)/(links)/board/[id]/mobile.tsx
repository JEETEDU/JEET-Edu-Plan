"use client";

import TextareaAutosize from "react-textarea-autosize";
import {useEffect, useState} from "react";
import {cn, getStoreData, POST} from "@/app/(main)/components/functions";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, IComment, initArticle, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import {Category, Subject} from "@/app/(main)/(links)/home/(pages)/desktop";

// eslint-disable-next-line @next/next/no-async-client-component
export default function Chatting({id}: { id: number }) {
    const [selectedArticle, setSelectedArticle] = useState<IArticle>(initArticle);
    const [comments, setComments] = useState<IComment[]>([])

    function reload() {
        (async () => {
            const articleInfo: {
                article: IArticle,
                comments: IComment[]
            } = await loadArticleInfo(id);

            setSelectedArticle(articleInfo.article);
            setComments(articleInfo.comments);
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
            {(screen < 2) && (
                <>
                    <div className="flex-1 w-full overflow-hidden flex flex-col">
                        {/*<h3 className="text-lg font-semibold text-gray-800 mb-4">댓글</h3>*/}
                        <Scrollbars
                            className="w-full h-full"
                            universal
                            autoHide
                        >
                            {comments.map((comment, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-white border rounded-lg flex items-start gap-4 my-2"
                                >
                                    {/*<div className="flex-shrink-0 bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">*/}
                                    {/*    {comment.name.charAt(0)}*/}
                                    {/*</div>*/}
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-gray-700">{comment.name}</h4>
                                            {comment.attach_files.length > 0 && (
                                                <a
                                                    href="#"
                                                    className="text-sm text-blue-500 hover:underline"
                                                >
                                                    {/*{comment.attach_files} 다운로드*/}
                                                </a>
                                            )}
                                        </div>
                                        <div className="mt-1 w-full break-all">{comment.content}</div>
                                    </div>
                                </div>
                            ))}
                        </Scrollbars>
                    </div>

                    <div className="bg-white shadow rounded-lg w-full flex p-1 justify-between items-center">
                        <TextareaAutosize
                            cacheMeasurements={true}
                            className="mx-3 w-full overflow-hidden resize-none m-1"
                            placeholder="댓글을 입력해 주세요"
                            onChange={(e) => {
                                setNewComments(e.target.value)
                            }}
                            value={newComments}
                        />
                        <button
                            className="h-full bg-blue-300 rounded-lg content-center hover:bg-blue-500"
                            onClick={addComment}
                        >
                            <div className="i-system-uicons-arrow-up-circle text-xl m-1"/>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
