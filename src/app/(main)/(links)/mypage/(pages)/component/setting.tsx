import Scrollbars from "react-custom-scrollbars-2";
import {Hr} from "@/app/(main)/(links)/home/(pages)/desktop";
import React from "react";
import {useRouter} from "next/navigation";
import {cn} from "@/app/(main)/components/functions";

export default function Setting() {
    // const {token, notificationPermissionStatus} = useFcmToken();

    const router = useRouter();

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
                <div className="flex flex-col w-full items-start p-1 space-y-4"
                >
                    <div
                        className={cn(
                            "flex items-center border-2 rounded p-1 text-lg md:hover:bg-white cursor-pointer",
                            (!("Notification" in window) || (Notification.permission === "denied")) ?
                                "border-red-400" :
                                (Notification.permission === "granted") ?
                                    "border-green-400" :
                                    ""
                        )}
                        onClick={async () => {
                            if (!("Notification" in window)) {
                                alert("이 브라우저는 알림이 지원되지 않습니다.");
                            }

                            if (Notification.permission !== "denied") {
                                const res = await Notification.requestPermission();
                                if (res) {
                                    router.refresh();
                                }
                            } else {
                                alert("알림이 차단되었습니다. 브라우저에서 해제해 주세요.");
                            }
                        }}
                    >
                        <div className={
                            (!("Notification" in window) || (Notification.permission === "denied")) ?
                                "i-system-uicons:cross-circle" :
                                (Notification.permission === "granted") ?
                                    "i-system-uicons:check-circle-outside" :
                                    "i-system-uicons:circle"
                        }/>
                        <div className="ms-2 text-sm font-medium text-gray-900">
                            푸쉬 알림 동의
                        </div>
                    </div>
                    <Hr/>
                </div>
            </Scrollbars>
        </>
    )
}