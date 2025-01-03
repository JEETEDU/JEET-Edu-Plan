"use client";

import '@toast-ui/editor/dist/toastui-editor.css';
import TuiEditor from "@/app/(main)/(loginPage)/editor";
import { useEffect, useRef, useState } from "react";

const save = (content) => {
    console.log(content);
    alert("임시 저장되었습니다!");
}

const upload = (content) => {
    console.log(content);
    alert("게시물이 업로드되었습니다!");
}

export default function HtmlEditor() {
    const editorRef = useRef<TuiEditor>();
    const [content, setContent] = useState({ title: "", value: "" });

    return (
        <div className="p-6 space-y-4 h-full flex flex-col bg-gray-50 rounded-lg shadow-md">
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
                        className="px-4 py-2 bg-yellow-400 text-white rounded-lg shadow hover:bg-yellow-500 transition"
                    >
                        임시 저장
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
            <div className="flex-1">
                <TuiEditor
                    height="100%"
                    ref={editorRef}
                    initialEditType="wysiwyg"
                    hideModeSwitch={true}
                    placeholder="공지를 작성해 주세요"
                    useCommandShortcut={true}
                    initialValue=" "
                    onChange={() => {
                        setContent({
                            title: content.title,
                            value: editorRef.current?.getInstance().getHTML().toString()
                        });
                    }}
                    toolbarItems={[
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task', 'indent', 'outdent'],
                        ['table', 'image', 'link'],
                        ['scrollSync'],
                    ]}
                />
            </div>
        </div>
    );
}
