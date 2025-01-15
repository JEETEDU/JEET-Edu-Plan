'use client';

import React, {useEffect, useState} from "react";
import {cn, getStoreData, patch} from "@/app/(main)/components/functions";
import TextareaAutosize from "react-textarea-autosize";
import Select from "react-select";

interface IUserInfo {
    uid: number;
    login_id: string;
    user_type: number;
    name: string;
    first_year: string;
    school: string;
    joined_term: string;
}

export default function UserDetail({uid, date, refresh}: { uid: number, date: Date, refresh: Function }) {
    const [userInfo, setUserInfo] = useState<IUserInfo>({
        first_year: "",
        joined_term: "",
        login_id: "",
        name: "",
        school: "",
        uid: 0,
        user_type: 0
    });
    const [editInfo, setEditInfo] = useState(false);

    useEffect(() => {
        (async () => {
            setUserInfo((await getStoreData(`/api/user/info/${uid}`, `user-info-${uid}`, true)).response.user);
        })();
    }, [uid]);

    const updateUserInfo = () => {
        patch('/api/admin/user', {
            user_id: uid,
            user_type: userInfo.user_type,
            name: userInfo.name,
            first_year: userInfo.first_year,
            school: userInfo.school,
            joined_term: userInfo.joined_term,
        }).then((r) => {
            console.log(r);
            refresh(false);
        });
    }

    const today = new Date();

    return (
        <div className="w-full min-h-full border-2 p-3 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <div className="flex items-center w-full justify-between">
                    <div className="text-2xl text-gray-800 font-semibold">
                        유저 정보
                    </div>
                    <div
                        className="px-3 py-1 bg-blue-500 text-white text-md font-bold rounded hover:bg-blue-600 w-fit"
                        onClick={() => {
                            if (editInfo) {
                                setEditInfo(false);
                                updateUserInfo();
                            } else {
                                setEditInfo(true);
                            }
                        }}
                    >
                        {editInfo ? "저장하기" : "편집하기"}
                    </div>
                </div>
                <div className="flex flex-col space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                                value={userInfo.login_id}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                이름
                            </label>
                            <TextareaAutosize
                                readOnly={!editInfo}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': editInfo}
                                )}
                                cacheMeasurements
                                value={userInfo.name}
                                onChange={(e) => {
                                    setUserInfo((prev) => {
                                        const obj: object = {...prev};
                                        obj.name = e.target.value;
                                        return obj;
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                중학교 입학 년도
                            </label>
                            <Select
                                className={cn(
                                    "text-xl font-bold w-full text-center",
                                    {"pointer-events-none": !editInfo}
                                )}
                                value={{
                                    value: String(userInfo.first_year || ""),
                                    label: String(userInfo.first_year || ""),
                                }}
                                components={{
                                    IndicatorSeparator: () => null
                                }}
                                options={Array.from({length: Number(today.getFullYear()) - 2020}, (_, i) => (
                                    {
                                        value: String(i + 2021),
                                        label: String(i + 2021),
                                    }
                                ))}
                                required
                                placeholder="입력해주세요"
                                onChange={(e) => {
                                    setUserInfo((prev) => {
                                        const obj: IUserInfo = {...prev};
                                        obj.first_year = e.value;
                                        return obj;
                                    });
                                }}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                중학교 이름
                            </label>
                            <TextareaAutosize
                                readOnly={!editInfo}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': editInfo}
                                )}
                                cacheMeasurements
                                value={userInfo.school}
                                onChange={(e) => {
                                    setUserInfo((prev) => {
                                        const obj: IUserInfo = {...prev};
                                        obj.school = e.target.value;
                                        return obj;
                                    });
                                }}
                            />
                        </div>
                        <div className="flex flex-col items-start w-full justify-between">
                            <label htmlFor="name" className="component-button-info">
                                지트 등록 분기
                            </label>
                            <TextareaAutosize
                                readOnly={!editInfo}
                                className={cn(
                                    "component-input resize-none",
                                    {'bg-white': editInfo}
                                )}
                                cacheMeasurements
                                value={userInfo.joined_term}
                                onChange={(e) => {
                                    setUserInfo((prev) => {
                                        const obj: IUserInfo = {...prev};
                                        obj.joined_term = e.target.value;
                                        return obj;
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}