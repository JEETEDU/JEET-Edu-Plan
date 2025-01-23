'use client';

import Scrollbars from "react-custom-scrollbars-2";
import React, {useEffect, useState} from "react";
import {GET} from "@/app/(main)/components/functions";
import Select from "react-select";

interface IHomework {
    article_i: number;
    due_date: string;
    done: number;
    title: string;
    subject: {
        name: string;
        id: number;
    },
    class_: {
        name: string;
        id: number;
    }
}

interface IClass {
    id: number;
    name: string;
    description: string;
}

interface ISubject {
    id: number;
    name: string;
}

interface IClassInfo {
    id: number;
    name: string;
    subjects: ISubject[];
}

export default function Homeworks() {
    const [homeworks, setHomeworks] = useState<IHomework[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [subjects, setSubjects] = useState<IClass[]>([]);

    const [page, setPage] = useState<number>(1);

    const [done, setDone] = useState<{ value: string, label: string }>({value: "0", label: "남은 숙제"});
    const [class_, setClass] = useState<{ value: string, label: string }>({value: "", label: "전체 반"});

    useEffect(() => {
        (async () => {
            const res: { success: boolean, homeworks: IHomework[] } = await GET(`/api/user/homework?$page=${page}`);
            if (res.success) {
                setHomeworks(res.homeworks);
            }
        })();
    }, [page]);

    useEffect(() => {
        (async () => {
            const res: { success: boolean, classes: IClass[] } = await GET('/api/user/class');
            if (res.success) {
                setClasses(res.classes);
            }
        })();
    }, []);

    useEffect(() => {
        console.log("Homeworks: ", homeworks);
    }, [homeworks.length]);

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <div className="flex flex-col w-full gap-2">
                <div className="grid grid-cols-3 gap-2">
                    <Select
                        // menuPlacement="top"
                        className="text-center"
                        components={{
                            IndicatorSeparator: () => null
                        }}
                        options={[
                            {value: "", label: "전체 숙제"},
                            {value: "0", label: "남은 숙제"},
                            {value: "1", label: "끝낸 숙제"},
                        ]}
                        required
                        value={done}
                        placeholder="반을 선택해 주세요"
                        instanceId={1}
                        onChange={(e) => setDone(e)}
                        isSearchable={false}
                    />
                    <Select
                        // menuPlacement="top"
                        components={{
                            IndicatorSeparator: () => null
                        }}
                        className="text-center"
                        options={[
                            {value: "", label: "전체 반"},
                            ...(classes.map((c) => {
                                return {value: String(c.id), label: c.name}
                            }))
                        ]}
                        required
                        value={class_}
                        placeholder="반을 선택해 주세요"
                        instanceId={1}
                        onChange={(e) => setClass(e)}
                        isSearchable={false}
                    />
                    <Select
                        // menuPlacement="top"
                        components={{
                            IndicatorSeparator: () => null
                        }}
                        className="text-center"
                        options={[
                            {value: "", label: "전체 숙제"},
                            {value: "0", label: "남은 숙제"},
                            {value: "1", label: "끝낸 숙제"},
                        ]}
                        required
                        value={done}
                        placeholder="반을 선택해 주세요"
                        instanceId={1}
                        onChange={(e) => setDone(e)}
                        isSearchable={false}
                    />

                </div>
            </div>
            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
            >
                {homeworks.map((homework, index) => (
                    <div
                        key={index}
                        className="block w-full"
                    >
                        <div className="p-3 mb-2 hover:bg-white rounded-lg border-2 w-full">
                            {JSON.stringify(homework)}
                        </div>
                    </div>
                ))}
            </Scrollbars>
        </div>

    );
}