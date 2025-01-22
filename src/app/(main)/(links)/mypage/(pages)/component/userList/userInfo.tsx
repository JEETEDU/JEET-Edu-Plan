import {cn, PATCH} from "@/app/(main)/components/functions";
import Select from "react-select";
import TextareaAutosize from "react-textarea-autosize";
import React, {useState} from "react";
import {IUserInfo} from "./userDetail";

export interface CUserInfo {
    uid: number;
    userInfo: IUserInfo;
    setUserInfo: (userInfo: IUserInfo) => void;
    refresh: (refreshHead?: boolean) => void;
}

export default function UserInfo(
    {
        uid,
        userInfo, setUserInfo,
        refresh,
    }: CUserInfo,
) {
    const updateUserInfo = () => {
        PATCH('/api/admin/user', {
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

    const [editInfo, setEditInfo] = useState(false);

    return (
        <div className="flex flex-col w-full gap-4">
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
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-start w-full justify-between">
                        <label htmlFor="name" className="component-button-info">
                            권한 변경
                        </label>
                        <Select
                            className={cn(
                                "text-xl font-bold w-full text-center",
                                {"pointer-events-none": !editInfo}
                            )}
                            value={
                                (userInfo.user_type === 1) ? {value: "1", label: "학생",}
                                    : (userInfo.user_type === 2) ? {value: "2", label: "선생님",}
                                        : {value: "3", label: "관리자",}
                            }
                            components={{
                                IndicatorSeparator: () => null
                            }}
                            options={
                                [
                                    {value: "1", label: "학생",},
                                    {value: "2", label: "선생님",},
                                    {value: "3", label: "관리자",}
                                ]
                            }
                            required
                            placeholder="입력해주세요"
                            onChange={(e) => {
                                setUserInfo((prev) => {
                                    const obj: IUserInfo = {...prev};
                                    if (e) {
                                        obj.user_type = Number(e.value);
                                    }
                                    return obj;
                                });
                            }}
                            isSearchable={false}
                        />
                    </div>
                    <div className="flex flex-col items-start w-full justify-between">
                        <label htmlFor="name" className="component-button-info">
                            아이디 (변경 불가)
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
                                    const obj: IUserInfo = {...prev};
                                    obj.name = e.target.value;
                                    return obj;
                                });
                            }}
                        />
                    </div>
                </div>
                {(userInfo.user_type === 1) && (
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
                                        if (e) {
                                            obj.first_year = e.value;
                                        }
                                        return obj;
                                    });
                                }}
                                isSearchable={false}
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
                                value={userInfo.school || ""}
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
                                value={userInfo.joined_term || ""}
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
                )}
            </div>
        </div>
    );
}