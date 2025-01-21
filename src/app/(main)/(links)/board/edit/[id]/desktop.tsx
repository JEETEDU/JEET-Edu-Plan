'use client';

import React, {useEffect, useState} from 'react';
import 'react-quill-new/dist/quill.snow.css';
import {IArticle, IComment, loadArticleInfo} from "@/app/(main)/(links)/board/component";
import HtmlEditor from "@/app/(main)/(links)/board/new/desktop";

export default function EditBoard({id}: { id: number }) {
    const [prevArticle, setPrevArticle] = useState<IArticle | null>(null);

    useEffect(() => {
        (async () => {
            const articleInfo: {
                article: IArticle,
                comments: IComment[]
            } = await loadArticleInfo(id);

            setPrevArticle(articleInfo.article);
        })().then();
    }, [id]);

    return (
        <HtmlEditor prev={prevArticle}/>
    );
}
