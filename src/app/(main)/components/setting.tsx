import Scrollbars from "react-custom-scrollbars-2";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";
import React from "react";
import useFcmToken from "@/hooks/useFcmToken";

export default function Setting() {
    const {token, notificationPermissionStatus} = useFcmToken();

    return (
        <>
            <div className="flex items-center w-full justify-between">
                <div className="text-3xl text-gray-800 font-semibold">
                    설정
                </div>
            </div>
            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
            >
                <div className="flex flex-col w-full items-start p-1 space-y-4">
                    <div className="flex items-center">
                        <input
                            checked={Notification.permission === "granted"}
                            id="checked-checkbox"
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            onChange={() => {
                                Notification.requestPermission().then((permission) => {
                                    if (permission === 'granted') {
                                        console.log('Notification permission granted.');
                                    }
                                })
                            }}
                        />
                        <label htmlFor="checked-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">푸쉬 알림 동의</label>
                    </div>
                    <button
                        disabled={!token}
                        className="mt-5"
                        // onClick={handleTestNotification}
                    >
                        Send Test Notification
                    </button>
                    <Hr/>
                    {/*<div className="text-xl text-gray-800 font-semibold">*/}
                    {/*    개발자 설정 (새로고침 시 초기화됩니다.)*/}
                    {/*</div>*/}
                    {/*<div className="flex items-center">*/}
                    {/*    <input*/}
                    {/*        checked={tabList["Log List"]}*/}
                    {/*        id="checked-checkbox"*/}
                    {/*        type="checkbox"*/}
                    {/*        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"*/}
                    {/*        onChange={() => setTabList(prev => {*/}
                    {/*            return {*/}
                    {/*                ...prev,*/}
                    {/*                "Log List": !prev["Log List"],*/}
                    {/*            }*/}
                    {/*        })}*/}
                    {/*    />*/}
                    {/*    <label htmlFor="checked-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">사용자 로그 보이기</label>*/}
                    {/*</div>*/}
                </div>
            </Scrollbars>
        </>
    )
}