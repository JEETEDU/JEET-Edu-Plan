"use client";

import TextareaAutosize from "react-textarea-autosize";

// eslint-disable-next-line @next/next/no-async-client-component
export default async function Mobile({id}: { id: number }) {
    const chat = {
        title: `${id}번 게시물 제목`,
        content: "내용",
        category: "과제", // 질문, 일반, 공지, 자료, 과제, 등등등
        due_date: "1월 10일",
        view_count: 10,
        comment_count: 10,
    };

    const comments = [
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
        {name: "나태양", content: "I am SUN", attach_files: ["1.jpg"]},
    ];

    return (
        <div className="bg-gray-100 px-4 flex flex-col h-full gap-4 pb-4">
            {/* Chat Header */}
            <div className="bg-white shadow rounded-lg w-full max-w-3xl p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{chat.title}</h2>
                <p className="text-gray-600">{chat.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                    <span className="bg-blue-100 text-blue-500 px-2 py-1 rounded">{chat.category}</span>
                    <div className="flex gap-4">
                        <span>조회수: {chat.view_count}</span>
                        <span>댓글: {chat.comment_count}</span>
                        <span>마감일: {chat.due_date}</span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 w-full max-w-3xl overflow-hidden flex flex-col">
                {/*<h3 className="text-lg font-semibold text-gray-800 mb-4">댓글</h3>*/}
                <div
                    className="space-y-4 overflow-y-auto"
                    // style={{ maxHeight: "400px" }} // Adjust height for scrollable area
                >
                    {comments.map((comment, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white border rounded-lg shadow-sm flex items-start gap-4"
                        >
                            <div className="flex-shrink-0 bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                {comment.name.charAt(0)}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-700">{comment.name}</h4>
                                    {comment.attach_files.length > 0 && (
                                        <a
                                            href="#"
                                            className="text-sm text-blue-500 hover:underline"
                                        >
                                            파일 다운로드
                                        </a>
                                    )}
                                </div>
                                <p className="text-gray-600 mt-1">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow rounded-lg w-full max-w-3xl flex p-1 justify-between items-center">
                <TextareaAutosize
                    cacheMeasurements={true}
                    className="mx-3 w-full overflow-hidden resize-none m-1"
                    placeholder="댓글을 입력해 주세요"
                />
                <div className="h-full bg-blue-300 rounded-lg content-center">
                    <div className="i-system-uicons-arrow-up-circle text-xl m-1"/>
                </div>
            </div>
        </div>
    );
}
