import React, {useEffect, useRef, useState} from "react";
import {IListUser} from "@/app/(main)/(links)/mypage/(pages)/common";
import {IClass, ISubjectInfo} from "@/app/(main)/(links)/mypage/(pages)/component/classSetting";
import Scrollbars from "react-custom-scrollbars-2";
import {cn, GET, POST} from "@/app/(main)/components/functions";
import Select from "react-select";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";

interface ILesson {
    class_: IClass;
    subject: ISubjectInfo;
}

export default function TeacherClass({text, className}: { text: string; className?: string }) {
    const [show, setShow] = useState<boolean>(false);
    const [userParams, setUserParams] = useState({
        user_type: "2",
        search_by: "name",
        search_string: ""
    });
    const [focusOnSearch, setFocusOnSearch] = useState<[boolean, boolean]>([false, false]);

    const _param = Object.entries(userParams).reduce((str, [k, v]) => {
        if (v !== "") {
            return `${str}&${String(k)}=${String(v)}`;
        } else {
            return str;
        }
    }, "order_by=name&order=ASC");

    const [page, setPage] = useState(1);
    const [count, setCount] = useState<number>(0);
    const [userList, setUserList] = useState<IListUser[]>([]);
    const [selectedUserList, setSelectedUserList] = useState<IListUser[]>([]);
    const [classList, setClassList] = useState<IClass[]>([]);
    const [selectedLessonList, setSelectedLessonList] = useState<ILesson[]>([]);
    const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
    const [subjectList, setSubjectList] = useState<ISubjectInfo[]>([]);

    useEffect(() => {
        if (selectedClass !== null) {
            (async () => {
                const resSubject: { success: boolean; subjects: ISubjectInfo[] } = await GET(`/api/admin/class/subject?class_id=${selectedClass.id}`);
                if (resSubject.success) {
                    setSubjectList(resSubject.subjects);
                }
            })();
        }
    }, [selectedClass]);

    const scrollUser = useRef<Scrollbars>(null);

    function wasUserSelected(uid: number): boolean {
        return selectedUserList.map(u => u.uid).includes(uid);
    }

    function wasLessonSelected(subject_id: number): boolean {
        return selectedLessonList.map(c => c.subject.id).includes(subject_id);
    }

    const refreshUsers = () => {
        setPage(1);
        (async () => {
            const res: { success: boolean; users: IListUser[] } = await GET(`/api/admin/user?${_param}`);
            if (res.success) {
                setUserList(res.users.filter(u => !wasUserSelected(u.uid)) || []);
                setCount(res.users.length);
            }
        })().then(() => {
            if (scrollUser.current) scrollUser.current.scrollToTop();
        });
    }

    const nextPage = () => {
        (async () => {
            const res: { success: boolean; users: IListUser[] } = await GET(`/api/admin/user?page=${page}&${_param}`);
            if (res.success) {
                const users: IListUser[] = res.users.filter(u => !wasUserSelected(u.uid));
                setUserList((prev) => [...prev, ...users]);
                setCount(p => p + res.users.length);
            }
        })();
    }

    useEffect(() => {
        if (page > 1) nextPage();
    }, [page]);

    useEffect(() => {
        refreshUsers();
    }, [userParams,]);

    const [search, setSearch] = useState<string>("");

    function refreshClasses() {
        (async () => {
            const res: { success: boolean; classes: IClass[] } = await GET(`/api/admin/class?name=${search}`);
            if (res.success) {
                setClassList(res.classes);
            }
        })();
    }

    useEffect(() => {
        refreshClasses();
    }, [search]);

    const [reg, setReg] = useState<boolean>(false);

    const [result, setResult] = useState<{ success: boolean; count: number }>({success: true, count: 0});

    const register = () => {
        if (selectedUserList.length === 0) return;
        if (selectedLessonList.length === 0) return;
        const res = confirm("선택한 유저에 대한 반의 등록을 진행하시겠습니까?");
        if (!res) return;
        setReg(true);

        selectedUserList.map((u) => {
            selectedLessonList.map(async (l) => {
                const r: { success: boolean; message: string } = await POST('/api/admin/class/join/teacher', {
                    class_id: l.class_.id,
                    user_id: u.uid,
                    subject_id: l.subject.id,
                });
                if (!r.success) {
                    setResult((prev) => {
                        return {success: false, count: prev.count + 1};
                    });
                } else {
                    setResult((prev) => {
                        return {success: prev.success, count: prev.count + 1};
                    });
                }
            })
        })
    }

    useEffect(() => {
        if ((result.count !== 0) && (result.count === (selectedLessonList.length * selectedUserList.length))) {
            alert('등록이 완료되었습니다!');
            setReg(false);
            setShow(false);
        }
    }, [result]);

    return (
        <>
            <div className={cn("cursor-pointer", className)} onClick={() => {
                setShow(true);
                setReg(false);
                refreshClasses();
                refreshUsers();
                setSelectedUserList([]);
                setSelectedLessonList([]);
                setSelectedClass(null);
            }}>
                {text}
            </div>
            {(show) && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-10"
                    onClick={() => {
                        if (!reg) {
                            setShow(false)
                        }
                    }} // 모달 바깥 클릭 시 닫힘
                >
                    <div
                        className={cn("bg-gray-100 rounded-lg shadow-lg p-4 flex flex-col justify-between gap-4 w-9/10 h-9/10 z-15")}
                        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않도록 방지
                    >
                        {(!reg) ? (
                            <div className="w-full grid grid-cols-5 gap-4 h-full">
                                <div className="flex flex-col items-start w-full border-2 rounded h-full p-2 gap-2">
                                    <div className="flex flex-row items-center justify-between w-full gap-2">
                                        <Select
                                            className="text-lg font-bold w-full"
                                            options={[
                                                {value: "2", label: "선생님"},
                                                {value: "3", label: "관리자"},
                                            ]}
                                            defaultValue={{value: "2", label: "선생님"}}
                                            onChange={(e) => {
                                                setUserParams((prev) => {
                                                    const obj = {...prev};
                                                    obj.user_type = e!.value;
                                                    return obj;
                                                })
                                            }}
                                            components={{
                                                IndicatorSeparator: () => null
                                            }}
                                            isSearchable={false}
                                        />
                                    </div>
                                    <div
                                        className={cn(
                                            "border-2 py-1 px-3 flex w-full bg-white items-center rounded",
                                            {"border-black": focusOnSearch[0]}
                                        )}
                                        onFocus={() => setFocusOnSearch(prev => [true, prev[1]])}
                                        onBlur={() => setFocusOnSearch(prev => [false, prev[1]])}
                                    >
                                        <input
                                            className="flex-1 outline-none"
                                            onChange={(e) => {
                                                setUserParams((prev) => {
                                                    const obj = {...prev};
                                                    obj.search_string = e.target.value;
                                                    return obj;
                                                })
                                            }}
                                        />
                                        <button
                                            className="i-heroicons-outline-search"
                                            // onClick={refreshUser}
                                        />
                                    </div>
                                    <Scrollbars
                                        className="w-full flex-1"
                                        universal
                                        autoHide
                                        ref={scrollUser}
                                        onScrollStop={async () => {
                                            if (scrollUser.current!.getScrollHeight() - scrollUser.current!.getClientHeight() <= scrollUser.current!.getScrollTop() + 10) {
                                                setPage((p) => {
                                                    if (count === p * 10) return p + 1;
                                                    return p;
                                                });
                                            }
                                        }}
                                    >
                                        {(userList.length === 0) && (
                                            <div className="w-full h-full flex justify-center items-center text-xl font-bold">
                                                검색 결과가 없습니다.
                                            </div>
                                        )}
                                        <div className="flex flex-col w-full items-center space-y-2 pb-3">
                                            {userList.map((u) => {
                                                return (
                                                    <div
                                                        key={u.uid}
                                                        className="border-2 rounded flex w-full justify-between p-2 gap-4 cursor-pointer md:hover:bg-white"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <div className="text-xl font-bold">
                                                                    {u.name as string}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {u.login_id as string}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="flex justify-center items-center px-1 rounded font-bold bg-green-500 text-white md:hover:bg-green-600"
                                                            onClick={() => {
                                                                setSelectedUserList((prev) => [...prev, u]);
                                                                setUserList((prev) => prev.filter((_u) => (_u.uid !== u.uid)));
                                                            }}
                                                        >
                                                            <div className="i-system-uicons-enter"/>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </Scrollbars>
                                    {(userList.length !== 0) && (
                                        <div
                                            className="w-full flex px-2 py-2 bg-blue-500 md:hover:bg-blue-600 justify-center items-center rounded text-white font-bold cursor-pointer"
                                            onClick={() => {
                                                (async () => {
                                                    userList.map(u => {
                                                        setSelectedUserList((prev) => [...prev, u]);
                                                    })
                                                })().then(() => setUserList([]));
                                            }}
                                        >
                                            전체 선택
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2 grid grid-cols-2 border-2 rounded gap-2 p-2">
                                    <div className="flex flex-col items-start w-full justify-between  h-full gap-2">
                                        <div
                                            className={cn(
                                                "border-2 py-1 px-3 w-full flex rounded justify-between items-center gap-3 bg-white",
                                                {"border-black": focusOnSearch[1]}
                                            )}
                                            onFocus={() => setFocusOnSearch(prev => [prev[0], true])}
                                            onBlur={() => setFocusOnSearch(prev => [prev[0], false])}
                                        >
                                            <input
                                                className="flex-1 outline-none"
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
                                            {(classList.length === 0) && (
                                                <div className="w-full h-full flex justify-center items-center text-xl font-bold">
                                                    검색 결과가 없습니다.
                                                </div>
                                            )}
                                            <div className="flex flex-col space-y-2 mb-1">
                                                {classList.map((class_) => (
                                                    <div
                                                        key={class_.id}
                                                        className="flex flex-row border-2 p-2 rounded gap-4 cursor-pointer md:hover:bg-white justify-center"
                                                    >
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
                                                        <div
                                                            className={cn(
                                                                "flex flex-row justify-center items-center px-1 rounded font-bold md:hover:bg-blue-600",
                                                                ((selectedClass !== null) && (class_.id === selectedClass.id)) ? "bg-blue-500 text-white" : "text-blue-500 md:hover:text-white"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedClass(class_);
                                                            }}
                                                        >
                                                            <div className="i-system-uicons:arrow-right-circle"/>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Scrollbars>
                                    </div>
                                    <div className="flex flex-col items-start w-full justify-between  h-full gap-2">
                                        <div
                                            className={cn(
                                                "border-2 py-1 px-3 w-full flex rounded justify-center items-center gap-3 bg-white",
                                                {"border-black": focusOnSearch[1]}
                                            )}
                                            onFocus={() => setFocusOnSearch(prev => [prev[0], true])}
                                            onBlur={() => setFocusOnSearch(prev => [prev[0], false])}
                                        >
                                            {(selectedClass === null) ? (
                                                "반을 선택해 주세요"
                                            ) : (
                                                "과목을 선택해 주세요"
                                            )}
                                        </div>
                                        {(selectedClass !== null) && (
                                            <>
                                                <Scrollbars
                                                    className="w-full h-full"
                                                    autoHide
                                                    universal
                                                >
                                                    {(subjectList.length === 0) && (
                                                        <div className="w-full h-full flex justify-center items-center text-xl font-bold">
                                                            선택한 반에 과목이 없습니다.
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col space-y-2 mb-1">
                                                        {subjectList.map((s) => (
                                                            <div
                                                                key={s.id}
                                                                className="flex flex-row border-2 p-2 rounded gap-4 cursor-pointer md:hover:bg-white justify-between w-full"
                                                            >
                                                                <div className="text-xl font-bold">
                                                                    {s.name}
                                                                </div>
                                                                <div
                                                                    className="flex flex-row justify-center items-center px-1 rounded font-bold bg-green-500 text-white md:hover:bg-green-600"
                                                                    onClick={() => {
                                                                        if (!wasLessonSelected(s.id)) {
                                                                            setSelectedLessonList((prev) => [...prev, {
                                                                                class_: selectedClass,
                                                                                subject: s
                                                                            }]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="i-system-uicons-enter"/>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Scrollbars>
                                                {(subjectList.length !== 0) && (
                                                    <div
                                                        className="w-full flex px-2 py-2 bg-blue-500 md:hover:bg-blue-600 justify-center items-center rounded text-white font-bold cursor-pointer"
                                                        onClick={() => {
                                                            subjectList.map(s => {
                                                                if (!wasLessonSelected(s.id)) {
                                                                    setSelectedLessonList((prev) => [...prev, {
                                                                        class_: selectedClass,
                                                                        subject: s
                                                                    }]);
                                                                }
                                                            })
                                                        }}
                                                    >
                                                        전체 선택
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-start w-full justify-between border-2 border-gray-400 p-2 gap-2 rounded h-full col-span-2">
                                    <div className="w-full flex items-center justify-center text-xl font-bold">
                                        선택한 유저 전체를 선택한 강의 전체에 등록합니다.
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 items-center w-full gap-2">
                                        {(selectedUserList.length === 0) ? (
                                            <div className="w-full h-full flex justify-center items-center text-xl font-bold">
                                                유저가 선택되지 않았습니다.
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                                                <Scrollbars
                                                    universal
                                                    autoHide
                                                >
                                                    <div className="flex flex-col w-full items-center space-y-2 pb-3 justify-center">
                                                        {selectedUserList.map((u) => {
                                                            return (
                                                                <div
                                                                    key={u.uid}
                                                                    className="border-2 rounded flex w-full justify-between p-2 gap-4 cursor-pointer md:hover:bg-white"
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div>
                                                                            <div className="text-xl font-bold">
                                                                                {u.name as string}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {u.login_id as string}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className="flex justify-center items-center px-1 rounded font-bold bg-red-500 text-white md:hover:bg-red-600"
                                                                        onClick={() => {
                                                                            setSelectedUserList((prev) => prev.filter((_u) => (_u.uid !== u.uid)));
                                                                            setUserList((prev) => [...prev, u]);
                                                                        }}
                                                                    >
                                                                        <div className="i-system-uicons-exit-right"/>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </Scrollbars>
                                                <div
                                                    className="w-full flex px-2 py-2 bg-red-500 md:hover:bg-red-600 justify-center items-center rounded text-white font-bold cursor-pointer"
                                                    onClick={() => {
                                                        (async () => {
                                                            selectedUserList.map(c => {
                                                                setUserList((prev) => [...prev, c]);
                                                            })
                                                        })().then(() => setSelectedUserList([]));
                                                    }}
                                                >
                                                    전체 선택 취소
                                                </div>
                                            </div>
                                        )}
                                        {(selectedLessonList.length === 0) ? (
                                            <div className="w-full h-full flex justify-center items-center text-xl font-bold">
                                                강의가 선택되지 않았습니다.
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                                                <Scrollbars
                                                    className="w-full flex-1"
                                                    autoHide
                                                    universal
                                                >
                                                    <div className="flex flex-col space-y-2 mb-1">
                                                        {selectedLessonList.map((l) => (
                                                            <div
                                                                key={l.subject.id}
                                                                className="flex flex-row border-2 p-2 rounded gap-4 cursor-pointer md:hover:bg-white justify-center"
                                                            >
                                                                {/*<div className="flex justify-center items-center border-2 px-1 border-green rounded font-bold bg-green text-white">*/}
                                                                {/*    {String(class_.id).padStart(2, '0')}*/}
                                                                {/*</div>*/}
                                                                <div className="flex flex-col space-y-2 flex-1">
                                                                    <div className="flex flex-row justify-between items-center">
                                                                        <div className="text-xl font-bold">
                                                                            {l.class_.name} {l.subject.name}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="flex justify-center items-center px-1 rounded font-bold bg-red-500 text-white md:hover:bg-red-600"
                                                                    onClick={() => {
                                                                        setSelectedLessonList((prev) => prev.filter((_c) => (_c.subject.id !== l.subject.id)));
                                                                    }}
                                                                >
                                                                    <div className="i-system-uicons-exit-right"/>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Scrollbars>
                                                <div
                                                    className="w-full flex px-2 py-2 bg-red-500 md:hover:bg-red-600 justify-center items-center rounded text-white font-bold cursor-pointer"
                                                    onClick={() => setSelectedLessonList([])}
                                                >
                                                    전체 선택 취소
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex justify-center items-center text-2xl font-bold whitespace-break-spaces text-center">
                                {"등록중입니다.\n\n잠시만 기다려주세요."}
                            </div>
                        )}
                        <div className="w-full flex flex-row gap-4 justify-end items-center">
                            <button
                                onClick={() => {
                                    const res = confirm('등록을 취소하시겠습니까? (선택한 반과 유저는 초기화됩니다.)')
                                    if (res) setShow(false);
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded md:hover:bg-red-600"
                                disabled={reg}
                            >
                                취소
                            </button>
                            <button
                                className="px-3 py-2 bg-blue-500 md:hover:bg-blue-600 text-white rounded"
                                onClick={register}
                                disabled={reg}
                            >
                                등록하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}