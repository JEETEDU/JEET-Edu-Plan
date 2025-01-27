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
    const [ready, setReady] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            setReady(true);
        } else if (!open && ready) {
            (async () => {
                const res: Blob = await fetch(`/api/admin/today/response/excel?${start ? `start_date=${parseDate(start)}&` : ""}${end ? `end_date=${parseDate(end)}` : ""}`, {
                    method: 'GET',
                }).then(
                    (res) => res.blob()
                ).then(
                    (res) => {
                        return res;
                    }
                )

                console.log(res)
                const data = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                const url = URL.createObjectURL(data);
                const link = document.createElement("a");
                link.href = url;
                link.download = `오늘의질문.xlsx`;
                link.click();
                URL.revokeObjectURL(url);
            })();
        }
    }, [open])

    return (
        <>
            <div
                className="flex justify-center items-center py-1 px-2 border-2 border-blue rounded hover:bg-white cursor-pointer"
                onClick={() => setOpen(true)}
            >
                오늘의 응답 엑셀 출력
            </div>
            {(open) && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
                    onClick={() => setOpen(false)} // 모달 바깥 클릭 시 닫힘
                >
                    <DateRangePicker
                        startDueDate={start}
                        setStartDueDateAction={setStart}
                        endDueDate={end}
                        setEndDueDateAction={setEnd}
                        closeAction={setOpen}
                        isMobile={false}
                        maxDate={today}
                    />
                </div>
            )}
        </>
    );
}