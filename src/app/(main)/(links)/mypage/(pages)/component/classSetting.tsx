'use client';

import Scrollbars from "react-custom-scrollbars-2";
import React, {useEffect, useState} from "react";
import {cn, DELETE, GET, PUT} from "@/app/(main)/components/functions";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";
import Select from "react-select";
import TextareaAutosize from "react-textarea-autosize";
import {Boolean} from "ts-toolbelt";

interface IClass {
    id: number;
    name: string;
    display: number;
    description: string;
}

interface IClassInfo {
    id: number;
    name: string;
    description: string;
    display: number;
    subjects: {
        id: number;
        name: string;
    }[];
    students: {
        uid: number;
        user_type: number;
        name: string;
        first_year: number;
        school: string;
        joined_term: string;
        login_id: string;
    }[];
    teachers: {
        uid: number;
        user_type: number;
        name: string;
        first_year: number;
        school: string;
        joined_term: string;
        login_id: string;
        subject: {
            id: number;
        };
    }[];
}

export default function ClassSetting() {
    const [classList, setClassList] = useState<IClass[]>([]);
    const [search, setSearch] = useState<string>("");
    const [focusOnSearch, setFocusOnSearch] = useState<boolean>(false);
    const [head, setHead] = useState<number>(0);

    const [selectedClass, setSelectedClass] = useState<IClassInfo>({display: 1, description: "", id: 0, name: "", students: [], subjects: [], teachers: []});

    const [edit, setEdit] = useState<boolean>(false);

    function refreshClasses() {
        (async () => {
            const res: { success: boolean; classes: IClass[] } = await GET(`/api/admin/class?name=${search}`);
            if (res.success) {
                setClassList(res.classes);
                setHead(res.classes[0].id);
            }
        })();
    }

    useEffect(() => {
        refreshClasses();
    }, [search]);

    useEffect(() => {
        (async () => {
            const res: { success: boolean; class: IClassInfo } = await GET(`/api/class/${head}`);
            if (res.success) {
                setSelectedClass(res.class);
            }
        })();
    }, [head]);

    const updateClassInfo = async () => {
        return await PUT(`/api/admin/class/`, {
            class_id: selectedClass.id,
            class_name: selectedClass.name,
            display: (selectedClass.display === 1),
            description: selectedClass.description,
        }).then((res: { success: boolean; message: string }) => {
            refreshClasses();
            return res;
        });
    };


    return <div className="grid grid-cols-3 h-full gap-2">
        <div className="h-full flex flex-col space-y-4">
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
                    onClick={refreshClasses}
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
                            {String(class_.id).padStart(3, '0')}
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
            className="w-full flex-1 col-span-2"
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
                            <TextareaAutosize
                                readOnly={true}
                                className={cn(
                                    "component-input resize-none"
                                )}
                                cacheMeasurements
                                value={selectedClass.id}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                이름
                            </label>
                            <TextareaAutosize
                                readOnly={!edit}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': edit}
                                )}
                                cacheMeasurements
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
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-between col-span-3">
                            <label htmlFor="name" className="component-button-info">
                                설명
                            </label>
                            <TextareaAutosize
                                readOnly={!edit}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': edit}
                                )}
                                cacheMeasurements
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
                </div>
            </div>
        </Scrollbars>
    </div>;
}