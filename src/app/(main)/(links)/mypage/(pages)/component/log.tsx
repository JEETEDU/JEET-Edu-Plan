'use client';

import React, {useEffect, useState} from "react";
import {GET} from "@/app/(main)/components/functions";
import Scrollbars from "react-custom-scrollbars-2";

interface ILog {
    id: number;
    user_id: number;
    detail: string;
    time: string;
}

export default function Log() {
    const [logs, setLogs] = useState<ILog[]>([]);
    const [paramData, setParamData] = useState<{ limit: number; userId: number | null; searchString: string | null }>({
        limit: 10,
        searchString: null,
        userId: null
    });

    interface IResponse {
        success: boolean;
        logs: ILog[];
    }

    useEffect(() => {
        const param = Object.entries(paramData).reduce((str, [key, value]) => {
            if (value) {
                return `${str}&${key}=${value}`;
            } else {
                return str;
            }
        }, 'page=1');

        (async () => {
            const response: IResponse = await GET(`/api/admin/log?${param}`);
            if (response.success) {
                setLogs(response.logs);
            }
        })();
    }, [paramData.userId, paramData.limit, paramData.searchString]);

    return (
        <div className="w-full h-full flex flex-col space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label htmlFor="name" className="component-button-info">
                        Limit
                    </label>
                    <input
                        // readOnly
                        className="component-input resize-none"
                        type="number"
                        onChange={(e) => {
                            setParamData((prev) => {
                                const obg = {...prev};
                                obg.limit = Number(e.target.value);
                                return obg;
                            });
                        }}
                        value={paramData.limit}
                    />
                </div>
                <div>
                    <label htmlFor="name" className="component-button-info">
                        User Id
                    </label>
                    <input
                        // readOnly
                        className="component-input resize-none"
                        type="number"
                        onChange={(e) => {
                            setParamData((prev) => {
                                const obg = {...prev};
                                obg.userId = Number(e.target.value);
                                return obg;
                            });
                        }}
                        value={paramData.userId || ""}
                    />
                </div>
                <div>
                    <label htmlFor="name" className="component-button-info">
                        Search String
                    </label>
                    <input
                        // readOnly
                        className="component-input resize-none"
                        type="text"
                        onChange={(e) => {
                            setParamData((prev) => {
                                const obg = {...prev};
                                obg.searchString = e.target.value;
                                return obg;
                            });
                        }}
                        value={paramData.searchString || ""}
                    />
                </div>
            </div>
            <Scrollbars
                className="w-full flex-1"
                universal
                autoHide
            >
                <div className="flex flex-col w-full items-center space-y-2">
                    {logs.map((log) => (
                        <div key={log.id} className="w-full border-2 p-2 rounded flex flex-row gap-4">
                            <div className="p-1 rounded border-2 border-green items-center flex">
                                {log.id}
                            </div>
                            <div className="flex flex-col items-center space-y-2 flex-1">
                                <div className="flex flex-row items-center gap-2 justify-between w-full">
                                    <div className="flex-1 justify-start">
                                        {log.detail}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-8 text-sm text-gray-600 w-full">
                                    <div>
                                        user_id: {log.user_id}
                                    </div>
                                    <div>
                                        {log.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Scrollbars>
        </div>
    );
}