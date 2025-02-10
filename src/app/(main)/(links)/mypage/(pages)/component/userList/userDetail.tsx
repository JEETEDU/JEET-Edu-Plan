'use client';

import React, {useEffect, useState} from "react";
import {getStoreData} from "@/app/(main)/components/functions";
import UserInfo from "./userInfo";
import ManageUser from "./manageUser";
import {TodayAnswer} from "@/app/(main)/(links)/mypage/(pages)/component/userList/todayAnswer";
import UserClass from "@/app/(main)/(links)/mypage/(pages)/component/userList/userClass";
import BookReport from "@/app/(main)/(links)/mypage/(pages)/component/userList/book";

export interface IUserInfo {
    uid: number;
    login_id: string;
    user_type?: number;
    name: string;
    first_year: string;
    school: string;
    joined_term: string;
}

const Hr = () => <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"/>;

export default function UserDetail({uid, date, refreshAction}: { uid: number, date: Date, refreshAction: (b?: boolean) => void }) {
    const [userInfo, setUserInfo] = useState<IUserInfo>({
        first_year: "",
        joined_term: "",
        login_id: "",
        name: "",
        school: "",
        uid: 0,
        user_type: 1
    });

    useEffect(() => {
        (async () => {
            const res = (await getStoreData(`/api/user/info/${uid}`, `user-info-${uid}`, true)).response;
            if (res.success) {
                setUserInfo(res.user);
            }
        })();
    }, [uid]);


    return (
        <div className="w-full min-h-full border-2 p-3 flex flex-col gap-4">
            <UserInfo
                uid={uid}
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                refresh={refreshAction}
            />
            <ManageUser uid={uid}/>
            <Hr/>
            <UserClass
                uid={uid}
                userType={userInfo.user_type || 1}
            />
            <Hr/>
            {(userInfo.user_type === 1) && (
                <>
                    <TodayAnswer date={date} uid={uid}/>
                    <Hr/>
                    <BookReport uid={uid} userInfo={userInfo}/>
                    <Hr/>
                </>
            )}
        </div>
    );
}