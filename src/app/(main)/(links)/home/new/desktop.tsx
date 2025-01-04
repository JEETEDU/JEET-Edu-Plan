'use client';

import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const save = (content) => {
    if (typeof window === 'undefined') {
        console.warn("sessionStorage is unavailable on the server.");
        return false;
    }

    const storage = sessionStorage;

    storage.setItem('new-notification-title', content.title)
    storage.setItem('new-notification-value', content.value)

    alert("임시 저장되었습니다!");
};

const load = (setState) => {
    if (typeof window === 'undefined') {
        console.warn("sessionStorage is unavailable on the server.");
        return false;
    }

    const storage = sessionStorage;
    const state = {
        title: storage.getItem('new-notification-title'),
        value: storage.getItem('new-notification-value'),
    }

    setState(state);

    alert("최근 편집 기록으로 복원되었습니다!");
}

const upload = (content) => {
    console.log(content);
    alert("게시물이 업로드되었습니다!");
};

export default function HtmlEditor() {
    const [content, setContent] = useState({ title: "", value: "" });

    return (
        <div className="p-6 space-y-4 h-screen flex flex-col bg-white">
            {/* 제목과 버튼 */}
            <div className="flex w-full justify-between items-center">
                <input
                    type="text"
                    placeholder="제목을 입력해 주세요."
                    className="flex-1 p-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={content.title}
                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                />
                <div className="flex w-fit space-x-2 ml-4">
                    <button
                        onClick={() => save(content)}
                        className="px-4 py-2 bg-yellow-400 rounded-lg shadow hover:bg-yellow-500 transition"
                    >
                        임시 저장
                    </button>
                    <button
                        onClick={() => load(setContent)}
                        className="px-4 py-2 bg-yellow-400 rounded-lg shadow hover:bg-yellow-500 transition"
                    >
                        불러오기
                    </button>
                    <button
                        onClick={() => upload(content)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                    >
                        게시하기
                    </button>
                </div>
            </div>

            {/* 에디터 */}
            <div className="flex-1 flex flex-col">
                <ReactQuill
                    theme="snow"
                    modules={{
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'], // toggled buttons
                            ['blockquote', 'code-block'],
                            ['link', 'image', 'video', 'formula'],

                            [{ header: 1 }, { header: 2 }], // custom button values
                            [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
                            [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
                            [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
                            [{ direction: 'rtl' }], // text direction

                            [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
                            [{ header: [1, 2, 3, 4, 5, 6, false] }],

                            [{ color: [] }, { background: [] }], // dropdown with defaults from theme
                            [{ font: [] }],
                            [{ align: [] }],

                            ['clean'], // remove formatting button
                        ],
                    }}
                    placeholder="공지를 입력해 주세요"
                    className="h-4/5"
                    onChange={(_content, _delta, _source, editor) => {
                        setContent({
                            title: content.title,
                            value: editor.getHTML().toString(),
                        });
                    }}
                    value={content.value}
                />
            </div>
        </div>
    );
}
