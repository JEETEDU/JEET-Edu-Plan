'use client';

import React, {useEffect, useState} from "react";
import {getStoreData} from "@/app/(main)/components/functions";
import UserInfo from "./userInfo";
import ManageUser from "./manageUser";
import {TodayAnswer} from "@/app/(main)/(links)/mypage/(pages)/component/userList/todayAnswer";
import UserClass from "@/app/(main)/(links)/mypage/(pages)/component/userList/userClass";

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

    const today = new Date();

    return (
        <div className="w-full min-h-full border-2 p-3 flex flex-col gap-4">
            <UserInfo
                uid={uid}
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                editInfo={editInfo}
                setEditInfo={setEditInfo}
                today={today}
                refresh={refresh}
            />
            <ManageUser uid={uid}/>
            <Hr/>
            <TodayAnswer date={date} uid={uid}/>
            <Hr/>
            <UserClass uid={uid} userType={userInfo.user_type || 1}/>
        </div>
    );
}