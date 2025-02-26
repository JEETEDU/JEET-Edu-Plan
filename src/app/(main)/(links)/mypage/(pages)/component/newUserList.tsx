import Scrollbars from "react-custom-scrollbars-2";
import {cn, GET, POST} from "@/app/(main)/components/functions";
import React, {useEffect, useRef, useState} from "react";
import {_IUser, IListUser} from "@/app/(main)/(links)/mypage/(pages)/common";

export default function NewUserList() {
    const [newUserList, setNewUserList] = useState<IListUser[]>([]);
    const [page, setPage] = useState(1);

    const nextPage = () => {
        (async () => {
            const res: { success: boolean; users: _IUser[] } = await GET(`/api/admin/user?user_type=0&order_by=name&order=ASC&page=${page}`);
            if (res.success) setNewUserList((prev) => [...prev, ...(res.users.map((u) => {
                return {...u, accept: false}
            }))]);
        })();
    }

    const refreshNewUser = () => {
        setPage(1);
        (async () => {
            const res: { success: boolean; users: _IUser[] } = await GET('/api/admin/user?user_type=0&order_by=name&order=ASC');
            if (res.success) {
                setNewUserList(res.users.map((u) => {
                    return {...u, accept: false}
                }));
            }

        })();
    }

    useEffect(() => {
        if (page !== 1) nextPage();
    }, [page]);

    const scrollbars = useRef<Scrollbars>(null);
    const items = useRef<HTMLDivElement>(null);

    useEffect(() => {
        refreshNewUser();
    }, []);

    useEffect(() => {
        if (newUserList.length > 0) {
            const scrollHeight = scrollbars.current?.getScrollHeight();
            const clientHeight = scrollbars.current?.getClientHeight();

            if (scrollHeight === clientHeight) {
                setPage(p => p + 1);
            }
        }
    }, [newUserList.length]);

    return (
        <>
            <div className="flex items-center w-full justify-between">
                <div className="text-3xl text-gray-800 font-semibold">
                    신규 학생/선생님 목록
                </div>
                <button
                    className="px-3 py-1 bg-blue-500 text-white text-lg font-bold rounded md:hover:bg-blue-600 w-fit"
                    onClick={refreshNewUser}
                >
                    새로고침
                </button>
            </div>
            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
                ref={scrollbars}
                onScrollStop={async () => {
                    if (scrollbars.current!.getScrollHeight() - scrollbars.current!.getClientHeight() <= scrollbars.current!.getScrollTop() + 10) {
                        setPage((p) => {
                            if (newUserList.length === 10 * p) {
                                return p + 1;
                            } else {
                                return p;
                            }
                        });
                    }
                }}
            >
                <div
                    className="flex flex-col w-full items-center space-y-4"
                    ref={items}
                >
                    {(newUserList.length === 0) && (
                        <div className="flex w-full h-full items-center bg-gray-100 justify-center text-xl font-bold">
                            신규 유저가 없습니다.
                        </div>
                    )}
                    {newUserList.map((u, i) => {
                        return (
                            <div key={u.uid} className="flex flex-row w-full justify-between items-center gap-8">
                                <div className="border-2 rounded flex p-2 items-center gap-8 flex-1">
                                    <div className="text-xl font-bold">
                                        {u.name as string}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {u.login_id as string}
                                    </div>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <button
                                        className={cn(
                                            "px-3 py-1 text-white text-lg font-bold rounded",
                                            (u.reject) ? "bg-black" : "bg-red-500 md:hover:bg-red-600 w-fit"
                                        )}
                                        onClick={async () => {
                                            await POST('/api/admin/user/reject', {user_id: u.uid});
                                            setNewUserList((users) => {
                                                const _users = [...users];
                                                _users[i].reject = true;
                                                return _users;
                                            })
                                        }}
                                    >
                                        {u.reject ? "거절완료" : "거절하기"}
                                    </button>
                                    <button
                                        className={cn(
                                            "px-3 py-1 text-white text-lg font-bold rounded",
                                            (u.reject) ? "bg-gray-500" : (u.accept) ? "bg-blue-500" : "bg-green-500 md:hover:bg-green-600 w-fit",
                                            {"pointer-events-none": (u.reject)},
                                        )}
                                        onClick={async () => {
                                            await POST('/api/admin/user/accept', {user_id: u.uid});
                                            setNewUserList((users) => {
                                                const _users = [...users];
                                                _users[i].accept = true;
                                                return _users;
                                            })
                                        }}
                                    >
                                        {u.accept ? "승인완료" : "승인하기"}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Scrollbars>
        </>
    );
}