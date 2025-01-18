import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {
    check_date_string,
    db_log,
    return_400, return_404, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {and, asc, count, desc, eq, like, ne, sql} from 'drizzle-orm';
import {QueryBuilder} from "drizzle-orm/mysql-core";
import {ArticleCategory} from "@/app/(others)/api/board/tools";
import {save_files, SavedFileList, update_files} from "@/app/(others)/api/(tools)/files";
import {AlertType, register_alert, register_alert_for_class} from "@/app/(others)/api/(tools)/alerts";
import {inArray} from "drizzle-orm/sql/expressions/conditions";


/**
 * @swagger
 * /api/homework:
 *   post:
 *     summary: Create a new homework article
 *     description: <b>Teacher</b><br>Create a new homework article
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Homework
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               article:
 *                 type: object
 *                 description: JSON string containing article information. class_id, title, content is required.
 *                 properties:
 *                   class_id:
 *                     type: number
 *                     example: 123
 *                   title:
 *                     type: string
 *                     example: "Hello, world!"
 *                   content:
 *                     type: string
 *                     example: "This is a test article."
 *                   is_notice:
 *                     type: number
 *                     example: 0
 *                   subject_id:
 *                     type: number
 *                     example: 123
 *                   due_date:
 *                     type: string
 *                     example: "2025-12-31"
 *                 required:
 *                   - class_id
 *                   - title
 *                   - content
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: List of files to upload associated with the article.
 *     responses:
 *       200:
 *         description: Successfully created article.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 article_id:
 *                   type: number
 *                   description: The ID of the created article.
 *                   example: 123
 *       400:
 *         description: Bad Request - Invalid/missing data or validation failed.
 *       401:
 *         description: Unauthorized - User is not logged in.
 *       403:
 *         description: Forbidden - User does not have the required permissions. Maybe the user is not in the class.
 *       500:
 *         description: Internal Server Error.
 */
export async function POST(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            let user_id = decoded.user_id;
            let user_type = decoded.user_type;
            if (user_type < UserType.TEACHER) return return_permission_denied();

            const data = await req.formData();
            const article = data.get("article");
            // @ts-ignore
            const files = data.getAll("files") as FileList;
            if (!article) return return_400("article is required");
            const article_json = JSON.parse(article.toString());

            let class_id: number = parseInt(article_json.class_id) ?? 0;
            let title: string = article_json.title.toString() ?? '';
            let content: string = article_json.content.toString() ?? '';
            let is_notice: number = parseInt(article_json.is_notice ?? 0);
            let subject_id: number = parseInt(article_json.subject_id ?? 0);
            let category = ArticleCategory.HOMEWORK;
            let due_date: string = article_json.due_date ?? '';

            if (!class_id) return return_400("class_id is required");
            if (!title) return return_400("title is required");
            if (title.length > 255) return return_400("title is too long");
            if (!content) return return_400("content is required");
            if (Number.isNaN(is_notice) || is_notice !== 1 && is_notice !== 0) return return_400("is_notice should be 0 or 1");
            if (Number.isNaN(subject_id)) return return_400("subject_id should be a number");
            if (!check_date_string(due_date)) return return_400("Invalid due_date");

            let [class_] =
                await tx.select({
                    subject_count: count(schema.teacherClasses.subject_id)
                })
                    .from(schema.teacherClasses)
                    .where(
                        and(
                            eq(schema.teacherClasses.class_id, class_id),
                            eq(schema.teacherClasses.user_id, user_id),
                            subject_id === 0 ? sql`1` : eq(schema.teacherClasses.subject_id, subject_id)
                        )
                    );
            if (!class_) return return_400("Class not found or you are not the teacher of the class");
            if (subject_id !== 0 && class_.subject_count === 0) return return_400("You are not the teacher of the subject or the subject is not in the class");

            let files_path: SavedFileList = await save_files(tx, files);

            // @ts-ignore
            let [article_id] = await tx.insert(schema.boards).values({
                    class_id: class_id,
                    user_id: user_id,
                    title: title,
                    content: content,
                    category: category,
                    due_date: due_date ?? null,
                    notice: is_notice,
                    subject_id: subject_id === 0 ? null : subject_id,
                    comment_count: 0,
                    attach_files: files_path.length === 0 ? null : files_path
                }
            ).$returningId();

            let users = await tx.select({
                user_id: schema.studentClasses.user_id,
            })
                .from(schema.studentClasses)
                .where(eq(schema.studentClasses.class_id, class_id));
            // @ts-ignore
            await tx.insert(schema.homeworks).values(users.map((u) => ({
                article_id: article_id.id,
                user_id: u.user_id,
                due_date: due_date ?? null,
                done: 0,
                class_id: class_id,
                title: title,
                subject_id: subject_id === 0 ? null : subject_id
            })));

            await register_alert_for_class(tx, class_id, `새 과제가 등록되었습니다.\n${title}`, AlertType.NOTICE, article_id.id);

            return NextResponse.json({
                success: true,
                article_id: article_id.id
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/homework:
 *   patch:
 *     summary: Update an article
 *     description: <b>Teacher</b><br>Updates an article by ID. Supports updating fields like title, content, notice flags, etc., while ensuring proper validations.
 *     tags:
 *       - Homework
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               article_id:
 *                 type: integer
 *                 description: The ID of the article to update
 *                 example: 3
 *               article:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Hello, world!"
 *                   content:
 *                     type: string
 *                     example: "This is a test article."
 *                   due_date:
 *                     type: string
 *                     example: "2025-12-31"
 *                   attach_files:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         path:
 *                           type: string
 *                           example: "/path/to/file"
 *                         name:
 *                           type: string
 *                           example: "file.txt"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: List of file attachments to upload
 *     responses:
 *       200:
 *         description: Article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, invalid or missing required fields
 *       401:
 *         description: Unauthorized, user not logged in or lacks permissions
 *       500:
 *         description: Internal server error
 */
export async function PATCH(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            let user_id = decoded.user_id;
            let user_type = decoded.user_type;
            if (user_type < UserType.TEACHER) return return_permission_denied();

            const data = await req.formData();
            const article_id = parseInt(data.get("article_id")?.toString() ?? '0');
            const article = data.get("article") ?? '{}';
            const article_json = JSON.parse(article.toString());
            // @ts-ignore
            const files = data.getAll("files") as FileList;

            let title: string = article_json.title?.toString() ?? '';
            let content: string = article_json.content?.toString() ?? '';
            let attach_files: SavedFileList = article_json.attach_files ?? [];
            let due_date: string = article_json.due_date ?? '';

            if (!article_id) return return_400("article_id is required");
            if (title && title.length > 255) return return_400("title is too long");
            if (!check_date_string(due_date)) return return_400("Invalid due_date");

            let [article_] =
                await tx.select()
                    .from(schema.boards)
                    .where(eq(schema.boards.id, article_id));
            if (!article_) return return_400("Article not found");
            if (article_.category !== ArticleCategory.HOMEWORK) return return_400("Article is not a homework");

            let update_data: any = {}
            if (title) update_data['title'] = title;
            if (content) update_data['content'] = content;
            if (due_date) update_data['due_date'] = due_date;

            let files_path: SavedFileList = await update_files(tx, files, JSON.parse(article_.attach_files?.toString() ?? '[]'), attach_files);
            if (files_path.length > 0) update_data['attach_files'] = files_path;
            if (article_.attach_files && article_.attach_files != files_path) update_data['attach_files'] = files_path;

            await tx.update(schema.boards)
                .set(update_data)
                .where(eq(schema.boards.id, article_id))

            let users = await tx.select({
                user_id: schema.studentClasses.user_id,
            })
                .from(schema.studentClasses)
                .where(eq(schema.studentClasses.class_id, article_.class_id));

            let update_data_homework: any = {}
            if (title) update_data_homework['title'] = title;
            if (due_date) update_data_homework['due_date'] = due_date;
            await tx.update(schema.homeworks)
                .set(update_data_homework)
                .where(eq(schema.homeworks.article_id, article_id));

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/homework:
 *   delete:
 *     summary: Delete an article
 *     description: <b>Teacher</b><br>Deletes an article by ID. This will also delete all associated comments and files.
 *     tags:
 *       - Homework
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the article to delete.
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, invalid or missing article ID
 *       401:
 *         description: Unauthorized, user not logged in or lacks permissions
 *       500:
 *         description: Internal server error
 */
export async function DELETE(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            let user_id = decoded.user_id;
            let user_type = decoded.user_type;
            if (user_type < UserType.TEACHER) return return_permission_denied();

            const data = req.nextUrl.searchParams;
            const article_id = parseInt(data.get('article_id') ?? '');
            if (Number.isNaN(article_id)) return return_400("article_id is required");

            let [article] =
                await tx.select()
                    .from(schema.boards)
                    .where(eq(schema.boards.id, article_id));
            if (!article) return return_400("Article not found");
            if (article.category !== ArticleCategory.HOMEWORK) return return_400("Article is not a homework");

            await tx.delete(schema.boards)
                .where(eq(schema.boards.id, article_id));

            await tx.delete(schema.homeworks)
                .where(eq(schema.homeworks.article_id, article_id));

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}