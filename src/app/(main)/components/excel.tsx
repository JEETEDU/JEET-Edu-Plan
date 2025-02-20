'use client';

import {DateRangePicker} from "@/app/(main)/(links)/home/components/homeworks";
import React, {useEffect, useState} from "react";
import {GET} from "@/app/(main)/components/functions";
import {parseDate} from "@/app/(main)/(links)/home/components/todo";

export default function Excel() {
    const today = new Date();
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(today);
    const [open, setOpen] = useState<boolean>(false);

    async function downloadExcel() {
        const res: Blob = await fetch(`/api/admin/today/response/excel?${start ? `start_date=${parseDate(start)}&` : ""}${end ? `end_date=${parseDate(end)}` : ""}`, {
            method: 'GET',
        }).then(
            (res) => res.blob()
        ).then(
            (res) => {
                return res;
            }
        );

        const data = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        const url = URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `오늘의질문 [ ${start?.toLocaleDateString() || ""} ~ ${end?.toLocaleDateString() || ""} ].xlsx`;
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            <div
                className="flex justify-center items-center py-1 px-2 border-2 border-blue rounded md:hover:bg-white cursor-pointer"
                onClick={() => setOpen(true)}
            >
                오늘의 응답 엑셀 출력
            </div>
            {(open) && (
                <div
                    className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-60"
                    onClick={() => setOpen(false)} // 모달 바깥 클릭 시 닫힘
                >
                    <DateRangePicker
                        startDueDate={start}
                        setStartDueDateAction={setStart}
                        endDueDate={end}
                        setEndDueDateAction={setEnd}
                        closeAction={async () => {
                            setOpen(false);
                            downloadExcel().then(() => alert("파일이 다운로드 되었습니다!"));
                        }}
                        isMobile={false}
                        maxDate={today}
                        minDate={new Date('2025-02-18')}
                    />
                </div>
            )}
        </>
    );
}