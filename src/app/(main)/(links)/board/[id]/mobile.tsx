"use client";

import TextareaAutosize from "react-textarea-autosize";
import React, {useEffect, useRef, useState} from "react";
import {cn, DELETE, getStoreData} from "@/app/(main)/components/functions";
import Scrollbars from "react-custom-scrollbars-2";
import {IArticle, IComment, initArticle, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import {Category, Subject} from "@/app/(main)/(links)/home/(pages)/desktop";
import Link from "next/link";
import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {IUserInfo} from "@/app/(main)/(links)/mypage/(pages)/component/userList/userDetail";

import 'react-quill/dist/quill.bubble.css'
import Loading from "@/app/(main)/loading";

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <Loading/>,
});

// eslint-disable-next-line @next/next/no-async-client-component
export default function Chatting({id, reloadArticlesAction = null}: { id: number; reloadArticlesAction?: (() => void) | null }) {

    const [selectedArticle, setSelectedArticle] = useState<IArticle>(initArticle);
    const [comments, setComments] = useState<IComment[]>([]);
    const [editComment, setEditComment] = useState<IComment | null>(null);
    const [fileList, setFileList] = useState<File[]>([]);

    const [user, setUser] = useState<IUserInfo>({
        first_year: "",
        joined_term: "",
        login_id: "",
        name: "",
        school: "",
        uid: 0,
        user_type: 1
    });

    useEffect(() => {
        (async () => {
            const userInfo = (await getStoreData('/api/user/info', 'user-info')).response.user;
            setUser(userInfo);
        })();
    }, []);

    const scrollbars = useRef<Scrollbars>(null);

    function reload() {
        (async () => {
            const articleInfo: {
                article: IArticle,
                comments: IComment[]
            } = await loadArticleInfo(id);

            setSelectedArticle(articleInfo.article);
            setComments(articleInfo.comments);
            setFileList([]);
        })().then();
    }

    useEffect(() => {
        if (editComment) {
            setNewComments(editComment.content);
        }
    }, [editComment]);

    useEffect(() => {
        if (screen < 2) scrollbars.current!.scrollToBottom();
    }, [comments.length]);

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
        }).then(r => r.json()).then(r => {
            reload();
        });
        setNewComments(""); // 입력란 초기화
        setFileList([]);
    };

    const updateComment = () => {
        if (!newComments.trim()) return; // 빈 댓글 방지
        if (!editComment) return;
        const formData = new FormData();
        formData.append("comment_id", String(editComment.id));
        formData.append("comment", JSON.stringify({
            content: newComments,
            attach_files: editComment.attach_files
        }));
        fileList.map((file: File) => {
            formData.append("files", file);
        })
        fetch('/api/board/comment', {
            method: "PATCH",
            body: formData
        }).then(r => r.blob()).then(r => {
            reload();
        });
        setNewComments(""); // 입력란 초기화
        setFileList([]);
        setEditComment(null);
    }

    const [screen, setScreen] = useState(0);

    const fileInput = () => {
        document.getElementById("fileUpload")!.click();
    }

    const router = useRouter();

    const delete_ = () => {
        const res = confirm("게시물을 삭제하시겠습니까?");
        if (res) {
            DELETE(`/api/board?article_id=${selectedArticle.id}`).then(() => {
                if (reloadArticlesAction !== null) {
                    reloadArticlesAction();
                } else {
                    router.push("/board");
                }
            });
        }
    }

    return (
        <div className="bg-gray-100 flex flex-col gap-4 h-full">
            {/* Chat Header */}
            <div className={cn(
                "bg-white flex flex-col shadow rounded-lg w-full p-4",
                {"h-full": screen === 2},
            )}>
                <div className="flex items-start flex-col gap-2">
                    <div className="flex w-full justify-between items-center">
                        <div className="flex gap-2 w-fit items-center">
                            {(selectedArticle.is_notice === 1) && (
                                <div className="flex flex-col border-2 border-blue-500 p-1 rounded justify-center items-end text-black">
                                    공지
                                </div>
                            )}
                            <Category category={selectedArticle.category}/>
                            <Subject subject={selectedArticle.subject.name || ""}/>
                        </div>
                        <div className="flex gap-2 w-fit items-center">
                            <button
                                className={cn("p-1 border-2 rounded", {"bg-gray-200": (screen === 0)})}
                                onClick={() => setScreen(0)}
                            >
                                <div className="i-system-uicons-scale-contract"/>
                            </button>
                            <button
                                className={cn("p-1 border-2 rounded", {"bg-gray-200": (screen === 2)})}
                                onClick={() => setScreen(2)}
                            >
                                <div className="i-system-uicons-scale-extend"/>
                            </button>
                            {((selectedArticle.user.id === user.uid) || (user.user_type! > 1)) && (
                                <>
                                    <Link
                                        href={`/board/edit/${selectedArticle.id}`}
                                        className="p-1 border-2 border-blue rounded lg:lg:hover:bg-blue lg:lg:hover:text-white duration-200"
                                    >
                                        <div className="i-system-uicons-write"/>
                                    </Link>
                                    <button
                                        onClick={delete_}
                                        className="p-1 border-2 border-red rounded lg:lg:hover:bg-red lg:lg:hover:text-white duration-200"
                                    >
                                        <div className="i-system-uicons-trash"/>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-xl font-bold text-gray-800 mb-2 break-all">
                        {selectedArticle.title || ""}
                    </div>
                </div>
                {(screen > 0) && (<>
                        <ReactQuill
                            className={cn(
                                "h-full max-h-full flex flex-col",
                                // {"grow": screen === 2},
                                // {"overflow-hidden truncate": screen < 2}
                            )}
                            value={selectedArticle.content}
                            readOnly
                            theme={'bubble'}
                        />
                        <Scrollbars
                            className="w-full h-fit mt-2"
                            universal
                            autoHide
                            autoHeight
                        >
                            <div className="flex flex-row gap-2 text-sm mb-2 items-center">
                                {selectedArticle.attach_files!.map((file, index) => (
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
                        <div className="flex items-center justify-end text-sm text-gray-500 mt-4 gap-2">
                            <div className="flex gap-4 flex-1 justify-end">
                                {(selectedArticle.category === 1) && (
                                    <div>
                                        마감일: {(new Date(selectedArticle.due_date || "")).toLocaleDateString()}
                                    </div>
                                )}
                                <div>
                                    댓글: {comments.length}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {(screen < 2) && <>
                <div className="flex-1 w-full overflow-hidden flex flex-col">
                    {/*<h3 className="text-lg font-semibold text-gray-800 mb-4">댓글</h3>*/}
                    <Scrollbars
                        className="w-full h-full"
                        universal
                        autoHide
                        ref={scrollbars}
                    >
                        <div className="flex flex-col space-y-2 w-full mb-2">
                            {comments.map((comment, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "p-3 bg-white border-2 rounded-lg flex flex-col items-center gap-2",
                                        {"border-black": ((editComment !== null) && (comment.id === editComment.id))}
                                    )}
                                >
                                    <div className="flex flex-row justify-between items-center gap-4 w-full text-sm">
                                        <div className={cn(
                                            "p-1 border-2 border-green rounded h-full text-black",
                                            {'bg-green font-bold': (comment.user_id === user.uid)}
                                        )}>
                                            {comment.user_name}
                                        </div>
                                        <div>
                                            {(comment.user_id === user.uid) && (
                                                <div className="flex gap-1 w-fit items-center">
                                                    <div
                                                        className={cn(
                                                            "p-1 border-2 border-blue rounded h-full cursor-pointer duration-200",
                                                            ((editComment === null) || (comment.id !== editComment.id)) ? "lg:lg:hover:bg-blue lg:lg:hover:text-white" : "lg:lg:hover:bg-white lg:lg:hover:text-black bg-blue text-white"
                                                        )}
                                                        onClick={() => {
                                                            if (editComment === null) {
                                                                setEditComment(comment);
                                                            } else {
                                                                setEditComment(null);
                                                                setNewComments("");
                                                            }
                                                        }}
                                                    >
                                                        <div className="i-system-uicons-write"/>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            const res = confirm("댓글을 삭제하시겠습니까?");
                                                            if (res) {
                                                                DELETE('/api/board/comment', {
                                                                    comment_id: comment.id,
                                                                }).then(reload);
                                                            }
                                                        }}
                                                        className="p-1 border-2 border-red rounded lg:hover:bg-red lg:hover:text-white duration-200"
                                                    >
                                                        <div className="i-system-uicons-trash"/>
                                                    </button>
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
                            className="h-full bg-blue-300 rounded-lg items-center flex flex-col justify-center content-center lg:hover:bg-blue-500 p-1"
                            onClick={(editComment === null) ? addComment : updateComment}
                        >
                            {(editComment === null) ? (
                                <div className="i-system-uicons-arrow-up-circle"/>
                            ) : (
                                <div className="i-system-uicons-floppy"/>
                            )}
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
                                {((fileList.length === 0) && (editComment == null)) && (
                                    <div className="text-gray-500">
                                        {"파일이 선택되지 않았습니다."}
                                    </div>
                                )}
                                {(editComment !== null) && editComment.attach_files.map((file, index) => (
                                    <div key={index} className="flex gap-1 items-center border rounded whitespace-nowrap pl-1">
                                        {file.name}
                                        <div
                                            className="lg:hover:bg-red p-1 rounded lg:hover:text-white duration-200"
                                            onClick={() => {
                                                setEditComment((prev) => {
                                                    if (prev === null) return prev;
                                                    const obj = {...prev};
                                                    obj.attach_files = obj.attach_files.filter((e) => e.path !== file.path);
                                                    return obj;
                                                });
                                            }}
                                        >
                                            <div className="i-system-uicons-cross-circle"/>
                                        </div>
                                    </div>
                                ))}
                                {fileList.map((file, index) => (
                                    <div key={index} className="flex items-center border rounded whitespace-nowrap p-1">
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        </Scrollbars>
                        <button
                            className="h-full bg-blue-300 rounded-lg content-center lg:hover:bg-blue-500 p-1"
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
            </>
            }
        </div>
    )
        ;
}
