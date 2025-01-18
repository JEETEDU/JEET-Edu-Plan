import {GET} from "@/app/(main)/components/functions";

export interface IArticle {
    id: number;
    title: string;
    content?: string;
    create_time: string;
    update_time: string;
    attach_files_exist: number;
    attach_files?: [
        {
            name: string;
            path: string;
        }
    ] | [];
    category: number;
    notice: number;
    due_date: string | null;
    comment_count: number;
    user: {
        id: number;
        name: string;
        user_type: number;
    };
    subject: {
        id: number | null;
        name: string | null;
    };
}

export const initArticle: IArticle = {
    attach_files_exist: 0,
    attach_files: [],
    category: 0,
    comment_count: 0,
    content: "",
    create_time: "",
    due_date: null,
    id: 0,
    notice: 0,
    subject: {
        id: null,
        name: null
    },
    title: "",
    update_time: "",
    user: {
        id: 0,
        name: "",
        user_type: 0
    }
}

export async function loadArticle(selectedClass: string): Promise<IArticle[]> {
    interface IResponseArticles {
        success: boolean;
        articles: IArticle[];
    }

    if (selectedClass) {
        const resArticle: IResponseArticles = await GET(`/api/board?class_id=${selectedClass.split('/')[0]}`);
        if (resArticle.success) {
            return resArticle.articles;
        }
    }

    return [];
}

export interface IComment {
    id: number;
    user_id: number;
    user_name: string;
    content: string;
    create_time: string;
    update_time: string;
    attach_files: [
        {
            name: string;
            path: string;
        }
    ]
}

export async function loadArticleInfo(id: number) {
    interface IResponseArticleInfo {
        success: boolean;
        article: IArticle;
        comments: IComment[];
    }

    const response: IResponseArticleInfo = await GET(`/api/board/${id}`);
    console.log(response);
    if (response.success) {
        return {
            article: response.article,
            comments: response.comments
        }
    }
    return {
        article: initArticle,
        comments: []
    }
}