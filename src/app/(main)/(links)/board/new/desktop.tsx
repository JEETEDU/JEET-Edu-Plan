'use client';

import React, {useEffect, useState} from 'react';
import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";
import {GET, getStoreData} from "@/app/(main)/components/functions";
import Select from "react-select";

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
    class_id: number;
    title: string;
    content: string;
    is_notice: number;
    category: number;
    subject_id: number;
}

const initContent: INewArticle = {
    category: 0,
    class_id: 0,
    content: "",
    is_notice: 0,
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

    useEffect(() => {
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
                setContent({...content, class_id: c.id});
            }
        })();
        setStorage(sessionStorage);
    }, [])

    useEffect(() => {
        (async () => {
            const res: { success: boolean; class: IClassInfo } = await GET(`/api/class/${selectedClass.split('/')[0]}`);
            if (res.success) {
                setSubjects(res.class.subjects);
                if (res.class.subjects.length > 0) {
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
        fetch('/api/board', {
            method: 'POST',
            body: formData
        }).then(res => res.json()).then((res) => {
            console.log(res);
        })
        alert("게시물이 업로드되었습니다!");
    };

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
                <div className="flex flex-row gap-2 h-full">
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
                        onClick={upload}
                        className="px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        게시하기
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
                            options={[
                                {label: "일반", value: '0'},
                                {label: "질문", value: '2'},
                                {label: "자료", value: '3'},
                            ]}
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
                                {value: "0", label: "공지 등록 안함"}
                            ] : [
                                {value: "0", label: "공지 등록 안함"},
                                {value: "1", label: "공지로 등록"},
                            ]}
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
                    placeholder="공지를 입력해 주세요"
                    className="h-4/5"
                    onChange={(_content, _delta, _source, editor) => {
                        setContent((prev) => {
                            const obj = {...prev};
                            obj.title = content.title;
                            obj.content = editor.getHTML().toString();
                            return obj;
                        });
                    }}
                    value={content.content}
                />
            </div>
        </div>
    );
}
