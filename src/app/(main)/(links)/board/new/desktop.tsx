'use client';

import React, {useEffect, useState} from 'react';
import 'react-quill-new/dist/quill.snow.css';
import dynamic from "next/dynamic";
import {GET, getStoreData} from "@/app/(main)/components/functions";
import Select from "react-select";
import Scrollbars from "react-custom-scrollbars-2";
import {useRouter} from "next/navigation";
import {IArticle} from "@/app/(main)/(links)/board/component";
import DatePicker from "react-datepicker";
import {ko} from "date-fns/locale";
import {DatepickerWrapper} from "@/app/(main)/(links)/home/components/homeworks";
import Loading from "@/app/(main)/loading";

import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <Loading/>,
});

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
    is_notice: number;
    class_id: number;
    subject_id: number;
    due_date: string;
}

const initContent: INewArticle = {
    category: 0,
    class_id: 0,
    content: "",
    is_notice: 0,
    subject_id: 0,
    title: "",
    due_date: ""
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

export default function HtmlEditor({prev = null}: { prev?: IArticle | null }) {
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
    const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<{ label: string; value: string }>({label: "로딩중...", value: ""});
    const [fileList, setFileList] = useState<File[]>([]);
    const [attachedFiles, setAttachedFiles] = useState<{ name: string; path: string }[]>([]);
    const [dueDate, setDueDate] = useState<{ due: Date; open: boolean }>({
        due: new Date(),
        open: false
    });

    const categories = ["일반", "숙제", "질문", "자료"];
    const noticeList = [
        {value: "0", label: "공지 등록 안함"},
        {value: "1", label: "공지로 등록"},
    ];

    useEffect(() => {
        if (prev !== null) {
            setContent({
                category: prev.category,
                class_id: 1, // prev.class_.id
                content: prev.content || "",
                is_notice: prev.is_notice,
                subject_id: prev.subject.id || 0,
                title: prev.title,
                due_date: prev.due_date?.split('T')[0] || ""
            });
            setAttachedFiles(prev.attach_files || [])
            setSelectedSubject({
                label: prev.subject.name || "",
                value: String(prev.subject.id)
            })
        }
    }, [prev]);

    useEffect(() => {
        if ((prev !== null) && (classes.length > 0)) {
            const c = classes.filter(c => c.id === prev.class_id)[0];
            setSelectedClass(`${c.id}/${c.name} | ${c.description}`);
        }
    }, [classes, prev]);

    useEffect(() => {
        (async () => {
            setUser((await getStoreData('/api/user/info', 'user-info')).response.user);

            const resClass: {
                success: boolean;
                classes: IClass[]
            } = (await getStoreData("/api/user/class", 'class-list')).response;
            if (resClass.success) {
                setClasses(resClass.classes);
                if (prev === null) {
                    const c = resClass.classes[0];
                    setSelectedClass(`${c.id}/${c.name} | ${c.description}`);
                }
            }
        })();
        setStorage(sessionStorage);
    }, [])

    useEffect(() => {
        (async () => {
            const res: { success: boolean; class_: IClassInfo } = await GET(`/api/class/${selectedClass.split('/')[0]}`);
            if (res.success) {
                setSubjects(res.class_.subjects);
                if (res.class_.subjects.length > 0) {
                    if (!prev) {
                        const s = res.class_.subjects[0];
                        setSelectedSubject({label: s.name, value: String(s.id)});
                        setContent({...content, subject_id: s.id});
                    } else {
                        setSelectedSubject({label: String(prev.subject.name), value: String(prev.subject.id)});
                        setContent({...content, subject_id: prev.subject.id || 1});
                    }
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
        fetch((content.category === 1) ? '/api/homework' : '/api/board', {
            method: 'POST',
            body: formData
        }).then(res => res.json()).then((res) => {
            if (res.success) {
                alert("게시물이 업로드되었습니다!");
                router.push('/board');
            }
        })
    };

    useEffect(() => {
        setContent(prev => {
            return {
                ...prev,
                due_date: `${dueDate.due.getFullYear()}-${(dueDate.due.getMonth() + 1).toString().padStart(2, '0')}-${dueDate.due.getDate().toString().padStart(2, '0')}`,
            }
        })
    }, [dueDate.due]);

    const update = () => {
        if (prev === null) return;
        if (!content.title.trim()) return;
        if (!content.content.trim()) return;
        const formData = new FormData();
        formData.append("article", JSON.stringify({
            title: content.title,
            content: content.content,
            category: content.category,
            subject_id: content.subject_id,
            attach_files: attachedFiles,
            is_notice: content.is_notice,
            due_date: content.due_date,
        }));
        fileList.map((file: File) => {
            formData.append("files", file);
        })
        formData.append("article_id", String(prev.id));
        fetch((content.category === 1) ? '/api/homework' : '/api/board', {
            method: 'PATCH',
            body: formData
        }).then(res => res.json()).then((res) => {
            if (res.success) {
                alert("게시물이 업데이트되었습니다!");
                router.push('/board');
            }
        })
    };

    const fileInput = () => {
        document.getElementById("fileUpload")!.click();
    }

    const today = new Date();

    return (
        <>
            {(dueDate.open) && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                    onClick={() => setDueDate({
                        due: dueDate.due,
                        open: false
                    })} // 모달 바깥 클릭 시 닫힘
                >
                    <div
                        className="flex flex-col bg-gray-100 gap-4 p-4 rounded items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full flex items-center justify-center text-center text-xl font-bold">
                            {dueDate.due.toDateString()}
                        </div>
                        <DatepickerWrapper className="w-fit text-center flex gap-4 justify-center">
                            <DatePicker
                                className="outline-none"
                                locale={ko}
                                selected={dueDate.due}
                                onChange={(e) => {
                                    setDueDate(prev => {
                                        return {
                                            due: e || today,
                                            open: prev.open
                                        }
                                    });
                                }}
                                dateFormat='yyyy-MM-dd'
                                placeholderText="전체 기한"
                                inline
                                minDate={today}
                            />
                        </DatepickerWrapper>
                        <div
                            className="w-full flex items-center justify-center text-center bg-blue-500 md:hover:bg-blue-600 text-white py-1 rounded"
                            onClick={() => setDueDate({
                                due: dueDate.due,
                                open: false
                            })}
                        >
                            저장하기
                        </div>
                    </div>
                </div>
            )}
            <div className="p-6 space-y-2 h-full flex flex-col">
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
                            className="px-3  rounded-lg md:hover:bg-gray-200 border-x-2 transition bg-white"
                        >
                            첨부파일 추가
                        </button>
                        <button
                            onClick={save}
                            className="px-3 bg-yellow-400 rounded-lg md:hover:bg-yellow-500 transition"
                        >
                            임시 저장
                        </button>
                        <button
                            onClick={load}
                            className="px-3 bg-yellow-400 rounded-lg md:hover:bg-yellow-500 transition"
                        >
                            불러오기
                        </button>
                        <button
                            onClick={(prev === null) ? upload : update}
                            className="px-3 bg-blue-500 text-white rounded-lg md:hover:bg-blue-600 transition"
                        >
                            {(prev === null) ? "게시하기" : "저장하기"}
                        </button>
                    </div>
                </div>

                <div className="flex flex-row w-full justify-between items-center gap-4">
                    <div className="flex-grow grid grid-cols-4 gap-2">
                        <div className="flex flex-col items-start w-full justify-start">
                            <label className="component-button-info">
                                게시할 반 (ex. G3-S)
                            </label>
                            <Select
                                className="w-full"
                                // menuPlacement="top"
                                options={(!prev) ? classes.map((c) => {
                                    return {
                                        label: `${c.name} | ${c.description}`,
                                        value: `${c.id}/${c.name} | ${c.description}`
                                    };
                                }) : classes.filter(c => c.id === prev.class_id).map((c) => {
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
                                    setSelectedClass(e!.value);
                                    setContent({...content, class_id: Number(e!.value.split('/')[0])});
                                }}
                                isSearchable={false}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-start">
                            <label className="component-button-info">
                                게시물 종류
                            </label>
                            <Select
                                className="w-full"
                                // menuPlacement="top"
                                options={(prev?.category !== 1) ? (
                                    categories.map((c, i) => {
                                        return {value: String(i), label: c}
                                    }).filter(c => (user.user_type !== 1) || (c.value !== '1')).filter(c => (prev?.category !== 1) || (c.value !== '1'))
                                ) : ([
                                    {value: "1", label: "숙제"}
                                ])}
                                required
                                value={{value: String(content.category), label: categories[content.category]}}
                                placeholder="게시물 종류를 선택해 주세요"
                                instanceId={1}
                                onChange={(e) => {
                                    setContent({...content, category: Number(e!.value)});
                                }}
                                isSearchable={false}
                            />
                            {(content.category === 1) && (
                                <button
                                    className="w-full border-2 rounded flex flex-row items-center py-1 px-2 mt-1 bg-white"
                                    onClick={() => setDueDate({
                                        due: dueDate.due,
                                        open: true
                                    })}
                                >
                                    마감일: {dueDate.due.toLocaleDateString()} 까지
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col items-start w-full justify-start">
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
                                    setSelectedSubject(e!);
                                    setContent({...content, subject_id: Number(e!.value)});
                                }}
                                isSearchable={false}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-start">
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
                                value={noticeList[content.is_notice]}
                                placeholder="과목을 선택해 주세요"
                                instanceId={1}
                                onChange={(e) => {
                                    setContent({...content, is_notice: Number(e!.value)});
                                }}
                                isSearchable={false}
                            />
                        </div>
                    </div>

                </div>
                <div className="flex flex-row w-full items-center gap-4 justify-between">
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
                                        className="md:hover:bg-red p-1 rounded md:hover:text-white "
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
                <div className="flex-1 max-h-full">
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
                        className="h-full max-h-full flex flex-col bg-white"
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
    );
}
