'use client';

import React, {useEffect, useState} from 'react';
import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";
import {GET, getStoreData} from "@/app/(main)/components/functions";
import Select from "react-select";
import Scrollbars from "react-custom-scrollbars-2";
import {useRouter, useSearchParams} from "next/navigation";
import {IArticle} from "@/app/(main)/(links)/board/component";

const ReactQuill = dynamic(() => import('react-quill-new'), {ssr: false})

interface IUserInfo {
    uid: number;
    login_id: string;
    user_type: number;
    name: string;
    first_year: number;
    school: string;
    joined_term: string;
}

interface INewArticle {
    title: string;
    content: string;
    category: number;
    notice: number;
    class_id: number;
    subject_id: number;
}

const initContent: INewArticle = {
    category: 0,
    class_id: 0,
    content: "",
    notice: 0,
    subject_id: 0,
    title: ""
}

interface IClassInfo {
    id: number;
    name: string;
    subjects: {
        id: number;
        name: string
    }[];
    students: {
        uid: string;
        user_type: number;
        name: string;
        first_year?: string;
        school?: string;
        joined_term?: string;
        login_id?: string;
    }[];
    "teachers": {
        uid: string;
        user_type: number;
        name: string;
        first_year?: string;
        school?: string;
        joined_term?: string;
        login_id?: string;
        subject: {
            id: number;
        };
    }[];
}

export default function HtmlEditor() {
    const params = useSearchParams();

    const router = useRouter();

    const [content, setContent] = useState<INewArticle>(initContent);
    const [storage, setStorage] = useState<Storage>();

    const [user, setUser] = useState<IUserInfo>({
        first_year: 0,
        joined_term: "",
        login_id: "",
        name: "",
        school: "",
        uid: 0,
        user_type: 1
    });

    interface IClass {
        id: number;
        name: string;
        description: string;
    }

    const [classes, setClasses] = useState<IClass[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("/로딩중...");
    const [category, setCategory] = useState<{ label: string; value: string }>({label: "일반", value: '0'})
    const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<{ label: string; value: string }>({label: "로딩중...", value: ""});
    const [notice, setNotice] = useState<{ label: string; value: string }>({label: "공지 등록 안함", value: "0"});
    const [fileList, setFileList] = useState<File[]>([]);
    const [prevId, setPrevId] = useState<number>(0);

    const [attachedFiles, setAttachedFiles] = useState<{ name: string; path: string }[]>([]);

    const categoryList = [
        {label: "일반", value: '0'},
        {label: "질문", value: '2'},
        {label: "자료", value: '3'},
    ];
    const noticeList = [
        {value: "0", label: "공지 등록 안함"},
        {value: "1", label: "공지로 등록"},
    ];

    const prev = params.get("prev");

    useEffect(() => {
        if (prev) {
            const _p: IArticle = JSON.parse(prev);
            setPrevId(_p.id);
        }
        (async () => {
            setUser((await getStoreData('/api/user/info', 'user-info')).response.user);

            const resClass: {
                success: boolean;
                classes: IClass[]
            } = (await getStoreData("/api/user/class", 'class-list')).response;
            if (resClass.success) {
                setClasses(resClass.classes);
                const c = resClass.classes[0];
                setSelectedClass(`${c.id}/${c.name} | ${c.description}`);
                if (!prevId) setContent({...content, class_id: c.id});
            }
        })();
        setStorage(sessionStorage);
    }, [])

    useEffect(() => {
        if (prevId !== 0) {
            const _p: IArticle = JSON.parse(prev);
            console.log(_p);
            setContent({
                category: _p.category,
                class_id: _p.class_?.id,
                content: _p.content || "",
                notice: _p.notice,
                subject_id: _p.subject.id,
                title: _p.title
            });
            const _c = [
                "일반",
                "_",
                "질문",
                "자료"
            ]
            setCategory({
                value: String(_p.category),
                label: _c[Number(_p.category)]
            });
            const _n = ["공지 등록 안함", "공지로 등록"];
            setNotice({
                value: String(_p.notice),
                label: _n[Number(_p.notice)]
            })
            setSelectedSubject({
                label: _p.subject.name!,
                value: String(_p.subject.id)
            })
            if (_p.attach_files_exist) setAttachedFiles(_p.attach_files!);
        }
    }, [prevId]);

    useEffect(() => {
        console.log(content);
        // if (content.title !== JSON.parse(prev).title) router.refresh();
    }, [content]);

    useEffect(() => {
        (async () => {
            const res: { success: boolean; class: IClassInfo } = await GET(`/api/class/${selectedClass.split('/')[0]}`);
            if (res.success) {
                setSubjects(res.class.subjects);
                if ((res.class.subjects.length > 0) && (!prev)) {
                    const s = res.class.subjects[0];
                    setSelectedSubject({label: s.name, value: String(s.id)});
                }
            }
        })();
    }, [selectedClass]);

    const save = () => {
        if (!storage) return;

        if (typeof window === 'undefined') {
            console.warn("sessionStorage is unavailable on the server.");
            return false;
        }

        storage.setItem('new-notification', JSON.stringify(content));

        alert("임시 저장되었습니다!");
    };

    const load = () => {
        if (!storage) return;

        if (typeof window === 'undefined') {
            console.warn("sessionStorage is unavailable on the server.");
            return false;
        }

        const state = storage.getItem('new-notification');

        if (state !== null) {
            setContent(JSON.parse(state));
        } else {
            setContent(initContent);
            alert(1)
        }

        alert("최근 편집 기록으로 복원되었습니다!");
    }

    const upload = () => {
        if (!content.title.trim()) return;
        if (!content.content.trim()) return;
        const formData = new FormData();
        formData.append("article", JSON.stringify(content));
        fileList.map((file: File) => {
            formData.append("files", file);
        })
        fetch('/api/board', {
            method: 'POST',
            body: formData
        }).then(res => res.json()).then((res) => {
            console.log(res);
        })
        alert("게시물이 업로드되었습니다!");
        router.push('/board');
    };

    const update = () => {
        if (!content.title.trim()) return;
        if (!content.content.trim()) return;
        const formData = new FormData();
        formData.append("article", JSON.stringify({
            title: content.title,
            content: content.content,
            category: content.category,
            subject_id: content.subject_id,
            attach_files: attachedFiles
        }));
        fileList.map((file: File) => {
            formData.append("files", file);
        })
        formData.append("article_id", prevId);
        fetch('/api/board', {
            method: 'PATCH',
            body: formData
        }).then(res => res.json()).then((res) => {
            console.log(res);
        })
        alert("게시물이 업데이트되었습니다!");
        router.push('/board');
    };

    const fileInput = () => {
        document.getElementById("fileUpload")!.click();
    }

    return (
        <div className="p-6 space-y-4 h-screen flex flex-col bg-white">
            {/* 제목과 버튼 */}
            <div className="flex w-full justify-between items-center gap-2">
                <input
                    type="text"
                    placeholder="제목을 입력해 주세요."
                    className="flex-1 p-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={content.title}
                    onChange={(e) => setContent({...content, title: e.target.value})}
                />
                <div className="flex flex-row gap-2 h-full font-bold text-lg">
                    <button
                        onClick={fileInput}
                        className="px-3  rounded-lg hover:bg-gray-100 border-x-2 transition"
                    >
                        첨부파일 추가
                    </button>
                    <button
                        onClick={save}
                        className="px-3 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition"
                    >
                        임시 저장
                    </button>
                    <button
                        onClick={load}
                        className="px-3 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition"
                    >
                        불러오기
                    </button>
                    <button
                        onClick={(prevId === 0) ? upload : update}
                        className="px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        {(prevId === 0) ? "게시하기" : "저장하기"}
                    </button>
                </div>
            </div>

            <div className="flex flex-row w-full justify-between items-center gap-4">
                <div className="flex-1 grid grid-cols-4 gap-2">
                    <div className="flex flex-col items-start w-full justify-between">
                        <label className="component-button-info">
                            게시할 반 (ex. G3-S)
                        </label>
                        <Select
                            className="w-full"
                            // menuPlacement="top"
                            options={classes.map((c) => {
                                return {
                                    label: `${c.name} | ${c.description}`,
                                    value: `${c.id}/${c.name} | ${c.description}`
                                };
                            })}
                            required
                            value={{value: selectedClass, label: selectedClass.split('/')[1]}}
                            placeholder="반을 선택해 주세요"
                            instanceId={1}
                            onChange={(e) => {
                                setSelectedClass(e.value);
                                setContent({...content, class_id: Number(e.value.split('/')[0])});
                            }}
                        />
                    </div>
                    <div className="flex flex-col items-start w-full justify-between">
                        <label className="component-button-info">
                            게시물 종류
                        </label>
                        <Select
                            className="w-full"
                            // menuPlacement="top"
                            options={categoryList}
                            required
                            value={category}
                            placeholder="게시물 종류를 선택해 주세요"
                            instanceId={1}
                            onChange={(e) => {
                                setCategory(e);
                                setContent({...content, category: Number(e.value)});
                            }}
                        />
                    </div>
                    <div className="flex flex-col items-start w-full justify-between">
                        <label className="component-button-info">
                            과목 설정
                        </label>
                        <Select
                            className="w-full"
                            // menuPlacement="top"
                            options={subjects.map((subject) => {
                                return {label: subject.name, value: String(subject.id)}
                            })}
                            required
                            value={selectedSubject}
                            placeholder="과목을 선택해 주세요"
                            instanceId={1}
                            onChange={(e) => {
                                setSelectedSubject(e);
                                setContent({...content, subject_id: Number(e.value)});
                            }}
                        />
                    </div>
                    <div className="flex flex-col items-start w-full justify-between">
                        <label className="component-button-info">
                            공지 설정
                        </label>
                        <Select
                            className="w-full"
                            // menuPlacement="top"
                            options={user.user_type === 1 ? [
                                noticeList[0]
                            ] : noticeList}
                            required
                            value={notice}
                            placeholder="과목을 선택해 주세요"
                            instanceId={1}
                            onChange={(e) => {
                                setNotice(e);
                                setContent({...content, is_notice: Number(e.value)});
                            }}
                        />
                    </div>
                </div>

            </div>
            <div className="flex flex-row w-full justify-between items-center gap-4 justify-between">
                {(prev) && (<div className="text-sm text-gray-600 whitespace-nowrap">내용이 보이지 않는다면 새로고침 해 주세요.</div>)}
                <Scrollbars
                    className="w-full h-full"
                    universal
                    autoHide
                    autoHeight
                >
                    <div className="flex flex-row gap-2 text-sm mb-2 items-center">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="flex gap-1 items-center border rounded whitespace-nowrap pl-1">
                                {file.name}
                                <div
                                    className="hover:bg-red p-1 rounded hover:text-white duration-200"
                                    onClick={() => {
                                        setAttachedFiles((prev) => {
                                            return prev.filter((p) => p.path !== file.path);
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
            </div>
            {/* 에디터 */}
            <div className="flex-1 flex flex-col">
                <ReactQuill
                    theme="snow"
                    modules={{
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'], // toggled buttons
                            ['blockquote', 'code-block'],
                            ['link', 'image', 'video', 'formula'],

                            [{header: 1}, {header: 2}], // custom button values
                            [{list: 'ordered'}, {list: 'bullet'}, {list: 'check'}],
                            [{script: 'sub'}, {script: 'super'}], // superscript/subscript
                            [{indent: '-1'}, {indent: '+1'}], // outdent/indent
                            [{direction: 'rtl'}], // text direction

                            [{size: ['small', false, 'large', 'huge']}], // custom dropdown
                            [{header: [1, 2, 3, 4, 5, 6, false]}],

                            [{color: []}, {background: []}], // dropdown with defaults from theme
                            [{font: []}],
                            [{align: []}],

                            ['clean'], // remove formatting button
                        ],
                    }}
                    className="h-4/5"
                    onChange={(_content, _delta, _source, editor) => {
                        setContent((prev) => {
                            const obj = {...prev};
                            obj.content = editor.getHTML().toString();
                            return obj;
                        });
                    }}
                    // readOnly
                    value={content.content}
                />
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
        </div>
    );
}
