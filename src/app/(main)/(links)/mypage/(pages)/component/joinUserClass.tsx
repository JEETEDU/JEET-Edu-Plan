'use client';

import {cn, GET, POST} from "@/app/(main)/components/functions";
import Select from "react-select";
import React, {useEffect, useRef, useState} from "react";
import {IListUser} from "@/app/(main)/(links)/mypage/(pages)/common";
import Scrollbars from "react-custom-scrollbars-2";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";
import {IClass} from "@/app/(main)/(links)/mypage/(pages)/component/classSetting";

export default function JoinUserClass({text, className}: { text: string; className?: string }) {
    const [show, setShow] = useState<boolean>(false);
    const [userParams, setUserParams] = useState({
        user_type: "1",
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
    const [userList, setUserList] = useState<IListUser[]>([]);
    const [selectedUserList, setSelectedUserList] = useState<IListUser[]>([]);
    const [classList, setClassList] = useState<IClass[]>([]);
    const [selectedClassList, setSelectedClassList] = useState<IClass[]>([]);

    const scrollUser = useRef<Scrollbars>(null);

    function wasUserSelected(uid: number): boolean {
        return selectedUserList.map(u => u.uid).includes(uid);
    }

    function wasClassSelected(id: number): boolean {
        return selectedClassList.map(c => c.id).includes(id);
    }

    const refreshUsers = () => {
        setPage(1);
        (async () => {
            const res: { success: boolean; users: IListUser[] } = await GET(`/api/admin/user?${_param}`);
            if (res.success) {
                setUserList(res.users.filter(u => !wasUserSelected(u.uid)) || []);
            }
        })().then(() => {
            if (scrollUser.current) scrollUser.current.scrollToTop();
        });
    }

    const nextPage = () => {
        (async () => {
            const res: { success: boolean; users: IListUser[] } = await GET(`/api/admin/user?page=${page + 1}&${_param}`);
            if (res.success) {
                const users: IListUser[] = res.users.filter(u => !wasUserSelected(u.uid));
                setUserList((prev) => [...prev, ...users]);
            }
        })();
    }

    useEffect(() => {
        refreshUsers();
    }, [userParams,]);

    const [search, setSearch] = useState<string>("");

    function refreshClasses() {
        (async () => {
            const res: { success: boolean; classes: IClass[] } = await GET(`/api/admin/class?name=${search}`);
            if (res.success) {
                setClassList(res.classes.filter(c => !wasClassSelected(c.id)));
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
        if (selectedClassList.length === 0) return;
        const res = confirm("선택한 유저에 대한 반의 등록을 진행하시겠습니까?");
        if (!res) return;
        setReg(true);

        selectedUserList.map((u) => {
            return selectedClassList.map(async (c) => {
                if (u.user_type === 1) {
                    const r: { success: boolean; message: string } = await POST('/api/admin/class/join/student', {
                        class_id: c.id,
                        user_id: u.uid,
                    });
                    console.log(r.success);
                    if (!r.success) setResult((prev) => {
                        return {success: false, count: prev.count + 1};
                    });
                } else {
                    const r: { success: boolean; message: string } = await POST('/api/admin/class/join/teacher', {
                        class_id: c.id,
                        user_id: u.uid,
                    });
                    console.log(r.success);
                    if (!r.success) setResult((prev) => {
                        return {success: false, count: prev.count + 1};
                    });
                }
                setResult((prev) => {
                    return {success: prev.success, count: prev.count + 1};
                });
            })
        })
    }

    useEffect(() => {
        console.log(result);
        if ((result.count !== 0) && (result.count === (selectedUserList.length * selectedClassList.length))) {
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
                setSelectedClassList([]);
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
                            <div className="w-full grid grid-cols-4 gap-4 h-full">
                                <div className="flex flex-col items-start w-full border-2 rounded h-full p-2 gap-2">
                                    <div className="flex flex-row items-center justify-between w-full">
                                        <Select
                                            className="text-lg font-bold"
                                            options={[
                                                {value: "1", label: "학생 목록"},
                                                {value: "2", label: "선생 목록"},
                                                {value: "3", label: "관리자"},
                                            ]}
                                            defaultValue={{value: "1", label: "학생 목록"}}
                                            onChange={(e) => {
                                                setUserParams((prev) => {
                                                    const obj = {...prev};
                                                    obj.user_type = e.value;
                                                    return obj;
                                                })
                                            }}
                                            components={{
                                                IndicatorSeparator: () => null
                                            }}
                                            isSearchable={false}
                                        />
                                        <Select
                                            options={[
                                                {value: "name", label: "이름 (ex. 나태양)"},
                                                {value: "first_year", label: "중학교 입학 년도 (ex. 2024)"},
                                                {value: "school", label: "중학교 이름 (ex. 지트중학교, 지트중)"},
                                                {value: "joined_term", label: "지트 등록 분기 (ex. J)"},
                                            ]}
                                            placeholder={'검색 조건'}
                                            onChange={(e) => {
                                                setUserParams((prev) => {
                                                    const obj = {...prev};
                                                    obj.search_by = e.value;
                                                    return obj;
                                                })
                                            }}
                                            defaultValue={{value: "name", label: "이름 (ex. 나태양)"}}
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
                                            if (scrollUser.current!.getScrollHeight() - scrollUser.current!.getClientHeight() <= scrollUser.current!.getScrollTop()) {
                                                (async () => {
                                                    nextPage();
                                                    setPage((p) => p + 1);
                                                })().then(() => {
                                                    scrollUser.current!.scrollTop(scrollUser.current!.getScrollTop() - 10);
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
                                                        className="border-2 rounded flex w-full justify-between p-2 gap-4 cursor-pointer hover:bg-white"
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
                                                        <div className="flex flex-col flex-1">
                                                            <div className="flex items-center justify-end">
                                                                {u.first_year} {u.joined_term}
                                                            </div>
                                                            <div className="flex items-center justify-end">
                                                                {u.school}
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="flex justify-center items-center px-1 rounded font-bold bg-green-500 text-white hover:bg-green-600"
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
                                            className="w-full flex px-2 py-2 bg-blue-500 hover:bg-blue-600 justify-center items-center rounded text-white font-bold cursor-pointer"
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
                                <div className="flex flex-col items-start w-full justify-between border-2 rounded h-full p-2 gap-2">
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
                                                    className="flex flex-row border-2 p-2 rounded gap-4 cursor-pointer hover:bg-white justify-center"
                                                >
                                                    {/*<div className="flex justify-center items-center border-2 px-1 border-green rounded font-bold bg-green text-white">*/}
                                                    {/*    {String(class_.id).padStart(2, '0')}*/}
                                                    {/*</div>*/}
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
                                                        className="flex justify-center items-center px-1 rounded font-bold bg-green-500 text-white hover:bg-green-600"
                                                        onClick={() => {
                                                            setSelectedClassList((prev) => [...prev, class_]);
                                                            setClassList((prev) => prev.filter((_c) => (_c.id !== class_.id)));
                                                        }}
                                                    >
                                                        <div className="i-system-uicons-enter"/>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Scrollbars>
                                    {(classList.length !== 0) && (
                                        <div
                                            className="w-full flex px-2 py-2 bg-blue-500 hover:bg-blue-600 justify-center items-center rounded text-white font-bold cursor-pointer"
                                            onClick={() => {
                                                (async () => {
                                                    classList.map(c => {
                                                        setSelectedClassList((prev) => [...prev, c]);
                                                    })
                                                })().then(() => setClassList([]));
                                            }}
                                        >
                                            전체 선택
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-start w-full justify-between border-2 border-gray-400 p-2 gap-2 rounded h-full col-span-2">
                                    <div className="w-full flex items-center justify-center text-xl font-bold">
                                        선택한 유저 전체를 선택한 반 전체에 등록합니다.
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
                                                    onScrollStop={async () => {
                                                        if (scrollUser.current!.getScrollHeight() - scrollUser.current!.getClientHeight() <= scrollUser.current!.getScrollTop()) {
                                                            (async () => {
                                                                nextPage();
                                                                setPage((p) => p + 1);
                                                            })().then(() => {
                                                                scrollUser.current!.scrollTop(scrollUser.current!.getScrollTop() - 10);
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <div className="flex flex-col w-full items-center space-y-2 pb-3 justify-center">
                                                        {selectedUserList.map((u) => {
                                                            return (
                                                                <div
                                                                    key={u.uid}
                                                                    className="border-2 rounded flex w-full justify-between p-2 gap-4 cursor-pointer hover:bg-white"
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
                                                                        {/*<div>*/}
                                                                        {/*    {(u.user_type === 1) ? "S" : (u.user_type === 2) ? "T" : "A"}*/}
                                                                        {/*</div>*/}
                                                                    </div>
                                                                    <div className="flex flex-col flex-1">
                                                                        <div className="flex items-center justify-end">
                                                                            {u.first_year} {u.joined_term}
                                                                        </div>
                                                                        <div className="flex items-center justify-end">
                                                                            {u.school}
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className="flex justify-center items-center px-1 rounded font-bold bg-red-500 text-white hover:bg-red-600"
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
                                                    className="w-full flex px-2 py-2 bg-red-500 hover:bg-red-600 justify-center items-center rounded text-white font-bold cursor-pointer"
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
                                        {(selectedClassList.length === 0) ? (
                                            <div className="w-full h-full flex justify-center items-center text-xl font-bold">
                                                반이 선택되지 않았습니다.
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col justify-center items-center gap-2">
                                                <Scrollbars
                                                    className="w-full flex-1"
                                                    autoHide
                                                    universal
                                                >
                                                    <div className="flex flex-col space-y-2 mb-1">
                                                        {selectedClassList.map((class_) => (
                                                            <div
                                                                key={class_.id}
                                                                className="flex flex-row border-2 p-2 rounded gap-4 cursor-pointer hover:bg-white justify-center"
                                                            >
                                                                {/*<div className="flex justify-center items-center border-2 px-1 border-green rounded font-bold bg-green text-white">*/}
                                                                {/*    {String(class_.id).padStart(2, '0')}*/}
                                                                {/*</div>*/}
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
                                                                    className="flex justify-center items-center px-1 rounded font-bold bg-red-500 text-white hover:bg-red-600"
                                                                    onClick={() => {
                                                                        setSelectedClassList((prev) => prev.filter((_c) => (_c.id !== class_.id)));
                                                                        setClassList((prev) => [...prev, class_]);
                                                                    }}
                                                                >
                                                                    <div className="i-system-uicons-exit-right"/>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Scrollbars>
                                                <div
                                                    className="w-full flex px-2 py-2 bg-red-500 hover:bg-red-600 justify-center items-center rounded text-white font-bold cursor-pointer"
                                                    onClick={() => {
                                                        (async () => {
                                                            selectedClassList.map(c => {
                                                                setClassList((prev) => [...prev, c]);
                                                            })
                                                        })().then(() => setSelectedClassList([]));
                                                    }}
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
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                disabled={reg}
                            >
                                취소
                            </button>
                            <button
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
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