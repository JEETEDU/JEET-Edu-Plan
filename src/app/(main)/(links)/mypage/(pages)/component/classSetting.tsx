'use client';

import Scrollbars from "react-custom-scrollbars-2";
import React, {useEffect, useState} from "react";
import {cn, DELETE, GET, POST, PUT} from "@/app/(main)/components/functions";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";
import Select from "react-select";
import JoinUserClass from "@/app/(main)/(links)/mypage/(pages)/component/joinUserClass";

export interface IClass {
    id: number;
    name: string;
    display: number;
    description: string;
    selected?: boolean;
}

interface IStudent {
    uid: number;
    user_type: number;
    name: string;
    first_year: number;
    school: string;
    joined_term: string;
    login_id: string;
}

interface ITeacher {
    uid: number;
    user_type: number;
    name: string;
    subjects: number[];
}

interface IClassInfo {
    id: number;
    name: string;
    description: string;
    display: number;
    subjects: {
        id: number;
        name: string;
        teachers: number[];
    }[];
    students: IStudent[];
    teachers: ITeacher[];
}

interface ISubjectInfo {
    id: number;
    name: string;
    class_: {
        id: number;
        name: string;
    };
    teachers: {
        uid: number;
        name: string;
    }[];
}

export default function ClassSetting() {
    const [classList, setClassList] = useState<IClass[]>([]);
    const [search, setSearch] = useState<string>("");
    const [focusOnSearch, setFocusOnSearch] = useState<boolean>(false);
    const [head, setHead] = useState<number>(0);

    const [selectedClass, setSelectedClass] = useState<IClassInfo>({
        display: 1,
        description: "",
        id: 0, name: "",
        students: [],
        subjects: [],
        teachers: []
    });
    const [subjectList, setSubjectList] = useState<ISubjectInfo[]>([]);

    const [edit, setEdit] = useState<boolean>(false);
    const [addSubject, setAddSubject] = useState<string | null>(null);

    function refreshClasses(resetHead: boolean = false) {
        (async () => {
            const res: { success: boolean; classes: IClass[] } = await GET(`/api/admin/class?name=${search}`);
            if (res.success) {
                setClassList(res.classes);
                if (resetHead) setHead(res.classes[0].id);
            }
        })();
    }

    useEffect(() => {
        refreshClasses(true);
    }, [search]);

    function refreshClass() {
        (async () => {
            const res: { success: boolean; class_: IClassInfo } = await GET(`/api/class/${head}`);
            if (res.success) {
                setSelectedClass(res.class_);
            }
            const resSubject: { success: boolean; subjects: ISubjectInfo[] } = await GET(`/api/admin/class/subject?class_id=${head}`);
            if (resSubject.success) {
                setSubjectList(resSubject.subjects);
            }
        })();
    }

    useEffect(() => {
        console.log(head)
        if (head !== 0) refreshClass();
    }, [head]);

    const updateClassInfo = async () => {
        return await PUT(`/api/admin/class/`, {
            class_id: selectedClass.id,
            class_name: selectedClass.name,
            display: (selectedClass.display === 1),
            description: selectedClass.description,
        }).then((res: { success: boolean; message: string }) => {
            refreshClasses(false);
            return res;
        });
    };

    const createSubject = async () => {
        if (!addSubject?.trim()) return {success: false, message: "no data"};
        return await POST(`/api/admin/class/subject`, {
            class_id: selectedClass.id,
            name: addSubject
        }).then((res: { success: boolean; message: string }) => {
            refreshClass();
            setAddSubject(null);
            return res;
        });
    }

    const [newClass, setNewClass] = useState<{ class_name: string; display: boolean; description: string } | null>(null);

    return <div className="grid grid-cols-4 h-full gap-2 max-w-full">
        {(newClass !== null) && (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
                onClick={() => setNewClass(null)} // 모달 바깥 클릭 시 닫힘
            >
                <div
                    className={cn("bg-gray-50 rounded-lg shadow-lg p-6 flex flex-col gap-8 w-8/10 max-h-9/10")}
                    onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                >
                    <div className="flex w-full justify-between items-center flex-col space-y-4">
                        <div className="w-full grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-start w-full justify-between col-span-2">
                                <label htmlFor="name" className="component-button-info">
                                    이름
                                </label>
                                <input
                                    className="component-input resize-none bg-white"
                                    value={newClass.class_name}
                                    placeholder="반 이름을 입력해주세요"
                                    onChange={(e) => {
                                        setNewClass((prev) => {
                                            if (prev !== null) {
                                                const obj = {...prev};
                                                obj.class_name = e.target.value;
                                                return obj;
                                            } else {
                                                return prev;
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div className="flex flex-col items-start w-full justify-between">
                                <label htmlFor="name" className="component-button-info">
                                    학생들에게 공개 여부
                                </label>
                                <Select
                                    className="text-lg font-bold w-full text-center"
                                    value={newClass.display ? {value: "1", label: "공개"} : {value: "0", label: "비공개"}}
                                    components={{
                                        IndicatorSeparator: () => null
                                    }}
                                    options={[
                                        {value: "true", label: "공개"},
                                        {value: "false", label: "비공개"}
                                    ]}
                                    required
                                    placeholder="입력해주세요"
                                    onChange={(e) => {
                                        setNewClass((prev) => {
                                            if (prev !== null) {
                                                const obj = {...prev};
                                                if (e) {
                                                    obj.display = (e.value === 'true');
                                                }
                                                return obj;
                                            } else {
                                                return prev;
                                            }
                                        });
                                    }}
                                    isSearchable={false}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-start w-full justify-between col-span-3">
                            <label htmlFor="name" className="component-button-info">
                                설명
                            </label>
                            <input
                                className={cn(
                                    "component-input resize-none bg-white"
                                )}
                                value={newClass.description || ""}
                                placeholder="반 설명을 입력해주세요"
                                onChange={(e) => {
                                    setNewClass((prev) => {
                                        if (prev !== null) {
                                            const obj = {...prev};
                                            obj.description = e.target.value;
                                            return obj;
                                        } else {
                                            return prev;
                                        }
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className="w-full flex justify-end items-center gap-6">
                        <button
                            onClick={async () => {
                                const res = await POST("/api/admin/class", newClass);
                                if (res.success) {
                                    alert(`새로운 반 ${newClass.class_name} 이(가) 생성되었습니다!`);
                                    setNewClass(null);
                                    refreshClasses();
                                } else {
                                    alert("정확한 정보를 입력해 주세요");
                                }
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            저장
                        </button>
                        <button
                            onClick={() => setNewClass(null)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        )}
        <div className="h-full flex flex-col space-y-4">
            <div
                className="bg-green-500 rounded text-white font-bold p-1 flex justify-center items-center hover:bg-green-600 cursor-pointer"
                onClick={() => setNewClass({description: "", display: true, class_name: ""})}
            >
                새로운 반 추가하기
            </div>
            <div
                className={cn(
                    "border-2 py-1 px-3 flex-1 flex rounded justify-between items-center gap-3",
                    {"border-black": focusOnSearch}
                )}
                onFocus={() => setFocusOnSearch(true)}
                onBlur={() => setFocusOnSearch(false)}
            >
                <input
                    className="flex-1 bg-gray-100 outline-none"
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />
                <button
                    className="i-heroicons-outline-search"
                    onClick={() => refreshClasses()}
                />
            </div>
            <Scrollbars
                className="w-full h-full"
                autoHide
                universal
            >
                <div className="flex flex-col space-y-2 mb-1">
                    {classList.map((class_) => <div
                        key={class_.id} className={cn("flex flex-row border-2 p-2 rounded gap-4 cursor-pointer hover:bg-white justify-center", {"border-black": (class_.id === head)})}
                        onClick={() => setHead(class_.id)}
                    >
                        <div className="flex justify-center items-center border-2 px-1 border-green rounded font-bold bg-green text-white">
                            {String(class_.id).padStart(2, '0')}
                        </div>
                        <div className="flex flex-col space-y-2 flex-1">
                            <div className="flex flex-row justify-between items-center">
                                <div className="text-2xl font-bold">
                                    {class_.name}
                                </div>
                                {(class_.display === 0) && (
                                    <div className="font-bold p-1 rounded bg-red text-white">
                                        비공개
                                    </div>
                                )}
                            </div>
                            {(class_.description) && (
                                <>
                                    <Hr/>
                                    <div className="flex justify-end text-gray-600">
                                        {class_.description}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>)}
                </div>
            </Scrollbars>
        </div>
        <Scrollbars
            className="w-full flex-1 col-span-3"
            universal
            autoHide
        >
            <div className="w-full min-h-full border-2 p-3 flex flex-col gap-4">
                <div className="flex flex-col w-full gap-4">
                    <div className="flex items-center w-full justify-between">
                        <div className="text-2xl text-gray-800 font-semibold">
                            반 정보
                        </div>
                        <div className="flex flex-row gap-4">
                            <div
                                className="px-3 py-1 bg-blue-500 text-white text-md font-bold rounded hover:bg-blue-600 w-fit"
                                onClick={() => {
                                    if (edit) {
                                        setEdit(false);
                                        updateClassInfo().then((r) => {
                                            if (r.success) alert("업데이트 되었습니다.");
                                        });
                                    } else {
                                        setEdit(true);
                                    }
                                }}
                            >
                                {edit ? "저장하기" : "편집하기"}
                            </div>
                            <div
                                className="px-3 py-1 bg-red-500 text-white text-md font-bold rounded hover:bg-red-600 w-fit"
                                onClick={async () => {
                                    const res = confirm("반을 삭제하시겠습니까?");
                                    if (res) {
                                        await DELETE(`/api/admin/class/`, {
                                            class_id: selectedClass.id,
                                        }).then(refreshClasses);
                                    }
                                }}
                            >
                                삭제하기
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                아이디
                            </label>
                            <input
                                readOnly={true}
                                className={cn(
                                    "component-input resize-none"
                                )}
                                value={selectedClass.id}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                이름
                            </label>
                            <input
                                readOnly={!edit}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': edit}
                                )}
                                value={selectedClass.name}
                                onChange={(e) => {
                                    setSelectedClass((prev) => {
                                        const obj: IClassInfo = {...prev};
                                        obj.name = e.target.value;
                                        return obj;
                                    });
                                }}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                공개 여부
                            </label>
                            <Select
                                className={cn(
                                    "text-lg font-bold w-full text-center",
                                    {"pointer-events-none": !edit}
                                )}
                                value={selectedClass.display === 1 ? {value: "1", label: "공개"} : {value: "0", label: "비공개"}}
                                components={{
                                    IndicatorSeparator: () => null
                                }}
                                options={[
                                    {value: "1", label: "공개"},
                                    {value: "0", label: "비공개"}
                                ]}
                                required
                                placeholder="입력해주세요"
                                onChange={(e) => {
                                    setSelectedClass((prev) => {
                                        const obj: IClassInfo = {...prev};
                                        if (e) {
                                            obj.display = Number(e.value);
                                        }
                                        return obj;
                                    });
                                }}
                                isSearchable={false}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-between col-span-3">
                            <label htmlFor="name" className="component-button-info">
                                설명
                            </label>
                            <input
                                readOnly={!edit}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': edit}
                                )}
                                value={selectedClass.description || ""}
                                onChange={(e) => {
                                    setSelectedClass((prev) => {
                                        const obj: IClassInfo = {...prev};
                                        obj.description = e.target.value;
                                        return obj;
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <Hr/>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-2xl text-gray-800 font-semibold">
                            유저 목록
                        </div>
                        <JoinUserClass text="유저 추가하기" className="bg-blue-500 hover:bg-blue-600 py-1 px-2 rounded font-bold text-white"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-start w-full justify-start gap-1">
                            <label className="text-lg flex items-center justify-center font-bold">
                                학생
                            </label>
                            {selectedClass.students.map((s) => {
                                return (
                                    <div
                                        key={s.uid}
                                        className="border-2 rounded flex w-full justify-between p-2 cursor-pointer hover:bg-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <div className="text-xl font-bold">
                                                    {s.name as string}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {s.login_id as string}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-1 justify-end">
                                            <div className="flex flex-col justify-center">
                                                <div className="flex items-center justify-end">
                                                    {String(s.first_year)} {s.joined_term as string}
                                                </div>
                                                <div className="flex items-center justify-end">
                                                    {s.school as string}
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const res = confirm(`${s.name} 학생을 반에서 제외하시겠습니까?`);
                                                    if (res) {
                                                        POST('/api/admin/class/quit/student', {
                                                            class_id: selectedClass.id,
                                                            user_id: s.uid
                                                        }).then(refreshClass);
                                                    }
                                                }}
                                                className="p-1 border-2 border-red rounded hover:bg-red hover:text-white duration-200"
                                            >
                                                <div className="i-system-uicons-exit-right"/>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex flex-col items-start w-full justify-start gap-1">
                            <label className="text-lg flex items-center justify-center font-bold">
                                선생님
                            </label>
                            {selectedClass.teachers.map((t) => {
                                return (
                                    <div
                                        key={t.uid}
                                        className="border-2 rounded flex w-full justify-between p-2 gap-8 cursor-pointer hover:bg-white items-center"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="text-xl font-bold">
                                                {t.name}
                                            </div>
                                            {(t.user_type === 3) && (
                                                <div className="text-sm text-gray-500">
                                                    관리자
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-row col-span-5 gap-2 justify-end items-center">
                                            {t.subjects.length} 개 과목
                                            <button
                                                onClick={async () => {
                                                    const res = confirm(`${t.name} 선생님을 반에서 제외하시겠습니까?`);
                                                    if (res) {
                                                        POST('/api/admin/class/quit/teacher', {
                                                            class_id: selectedClass.id,
                                                            user_id: t.uid
                                                        }).then(refreshClass);
                                                    }
                                                }}
                                                className="p-1 border-2 border-red rounded hover:bg-red hover:text-white duration-200"
                                            >
                                                <div className="i-system-uicons-exit-right"/>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <Hr/>
                    <div className="flex items-center w-full justify-between">
                        <div className="text-2xl text-gray-800 font-semibold">
                            과목 목록
                        </div>
                        <div
                            className="px-3 py-1 bg-green-500 text-white text-md font-bold rounded hover:bg-green-600 w-fit"
                            onClick={() => {
                                if (addSubject !== null) {
                                    setAddSubject(null);
                                    createSubject().then((r) => {
                                        if (r.success) alert("과목이 추가되었습니다.");
                                    });
                                } else {
                                    setAddSubject("");
                                }
                            }}
                        >
                            {(addSubject !== null) ? "저장하기" : "추가하기"}
                        </div>
                    </div>
                    {(addSubject !== null) && (
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                과목 이름
                            </label>
                            <input
                                autoFocus
                                className="component-input resize-none bg-white"
                                value={addSubject}
                                onChange={(e) => {
                                    setAddSubject(e.target.value);
                                }}
                            />
                        </div>
                    )}
                    <div>
                        <div className="flex flex-col items-start w-full justify-between gap-1">
                            {subjectList.map((s) => {
                                return (
                                    <div
                                        key={s.id}
                                        className="border-2 rounded grid grid-cols-6 gap-4 w-full justify-between p-2 cursor-pointer hover:bg-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-xl font-bold whitespace-nowrap">
                                                {s.name}
                                            </div>
                                        </div>
                                        <div className="flex flex-row col-span-5 gap-2 justify-end">
                                            {(s.teachers.length > 0) && (
                                                <Scrollbars
                                                    className="flex-grow h-full"
                                                    universal
                                                    autoHide
                                                    autoHeight
                                                >
                                                    <div className="flex flex-row gap-2 items-center justify-end">
                                                        {s.teachers.map((t) => {
                                                            return (
                                                                <div
                                                                    key={t.uid * s.id}
                                                                    className="border-2 rounded flex justify-between p-2 gap-4 cursor-pointer hover:bg-white"
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div>
                                                                            <div className="text-lg font-bold whitespace-nowrap">
                                                                                {t.name}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const res = confirm(`${t.name} 선생님을 ${selectedClass.name} 반의 ${s.name} 과목에서 제외하시겠습니까?`);
                                                                            if (res) {
                                                                                POST('/api/admin/class/quit/teacher', {
                                                                                    class_id: selectedClass.id,
                                                                                    user_id: t.uid,
                                                                                    subject_id: s.id
                                                                                }).then(refreshClass);
                                                                            }
                                                                        }}
                                                                        className="p-1 border-2 border-red rounded hover:bg-red hover:text-white duration-200"
                                                                    >
                                                                        <div className="i-system-uicons-exit-right"/>
                                                                    </button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </Scrollbars>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    const res = confirm(`${s.name} 과목을 제거하시겠습니까?`);
                                                    if (res) {
                                                        DELETE('/api/admin/class/subject', {
                                                            subject_id: s.id
                                                        }).then(refreshClass);
                                                    }
                                                }}
                                                className="p-1 border-2 border-red rounded hover:bg-red hover:text-white duration-200"
                                            >
                                                <div className="i-system-uicons-trash"/>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Scrollbars>
    </div>;
}