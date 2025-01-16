import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, asc, count, desc, eq, like, sql} from 'drizzle-orm';
import {
    check_date_string,
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {QueryBuilder} from "drizzle-orm/mysql-core";
import {delete_files, save_files, SavedFileList, update_files} from "@/app/(others)/api/(tools)/files";

/**
 * @swagger
 * /api/board:
 *   post:
 *     summary: Create a new article in the system
 *     description: Validates the user's token, processes form data, and creates a new article for the specified class and subject.
 *     tags:
 *       - Board
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               article:
 *                 type: object
 *                 description: JSON string containing article information. class_id, title, content is required. <br> Category(예시, 추후 수정예정) <br><li> 0 - None <li> 1 - Question <li> 2 - Notice <li> 3 - Homework
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
 *                   category:
 *                     type: number
 *                     example: 1
 *                   subject_id:
 *                     type: number
 *                     example: 123
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

            const data = await req.formData();
            const article = data.get("article");
            // @ts-ignore
            const files = data.getAll("files") as FileList;
            if (!article) return return_400("article is required");
            const article_json = JSON.parse(article.toString());

            let user_id = decoded.user_id;
            let user_type = decoded.user_type;

            let class_id: number = parseInt(article_json.class_id) ?? 0;
            let title: string = article_json.title.toString() ?? '';
            let content: string = article_json.content.toString() ?? '';
            let is_notice: number = parseInt(article_json.is_notice ?? 0);
            let category: number = parseInt(article_json.category ?? 0);
            let subject_id: number = parseInt(article_json.subject_id ?? 0);

            if (!class_id) return return_400("class_id is required");
            if (!title) return return_400("title is required");
            if (title.length > 255) return return_400("title is too long");
            if (!content) return return_400("content is required");
            if (Number.isNaN(is_notice) || is_notice !== 1 && is_notice !== 0) return return_400("is_notice is required(0 or 1)");
            if (is_notice === 1 && user_type < UserType.TEACHER) return return_permission_denied();
            if (Number.isNaN(category)) return return_400("category is required");
            if (Number.isNaN(subject_id)) return return_400("subject_id is required(number)");

            let [class_] =
                await tx.select({
                    class_count: count(schema.classes.id),
                    user_count: count(schema.users.uid),
                    subject_count: count(schema.subjects.id)
                })
                    .from(schema.classes)
                    .leftJoin(
                        user_type === UserType.STUDENT ? schema.studentClasses : schema.teacherClasses,
                        eq((user_type === UserType.STUDENT ? schema.studentClasses : schema.teacherClasses).class_id, schema.classes.id)
                    )
                    .leftJoin(
                        schema.users,
                        and(
                            eq((user_type === UserType.STUDENT ? schema.studentClasses : schema.teacherClasses).user_id, schema.users.uid),
                            eq(schema.users.uid, user_id)
                        )
                    )
                    .leftJoin(
                        schema.subjects,
                        eq(schema.subjects.id, Number.isNaN(subject_id) ? 0 : subject_id)
                    )
                    .where(eq(schema.classes.id, class_id))
            if (class_.class_count === 0) return return_400("Class not found");
            if (class_.user_count === 0 && user_type !== UserType.ADMIN) return return_permission_denied();
            if (subject_id && class_.subject_count === 0) return return_400("Subject not found");

            let files_path: SavedFileList = await save_files(tx, files);

            let [article_id] = await tx.insert(schema.boards).values({
                    class_id: class_id,
                    user_id: user_id,
                    title: title,
                    content: content,
                    category: category,
                    notice: is_notice,
                    subject_id: subject_id === 0 ? null : subject_id,
                    view_count: 0,
                    comment_count: 0,
                    attach_files: files_path.length === 0 ? null : files_path
                }
            ).$returningId();

            return NextResponse.json({
                success: true,
                article_id: article_id
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/board:
 *   patch:
 *     summary: Update an existing article
 *     description: Updates an existing article with new information. Only the user who created the article or a teacher can update it.
 *     tags:
 *       - Board
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               article:
 *                 type: object
 *                 description: Object containing the article details (class_id, title, content, etc.).<br>Attach_files is an array of file paths to attach to the article. This is for remove files by not including them in the array only. If you want to add new files, use the files field.
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Sample Article"
 *                   content:
 *                     type: string
 *                     example: "This is the content of the article."
 *                   is_notice:
 *                     type: integer
 *                     example: 0
 *                   category:
 *                     type: integer
 *                     example: 2
 *                   subject_id:
 *                     type: integer
 *                     example: 3
 *                   attach_files:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         path:
 *                           type: string
 *                           example: "/file/c02diejdklq.png"
 *                         name:
 *                           type: string
 *                           example: "file.png"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional files to attach to the article.
 *               article_id:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Article successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 article_id:
 *                   type: integer
 *                   example: 234
 *       400:
 *         description: Bad request. Missing or incorrect data.
 *       401:
 *         description: User is not logged in.
 *       403:
 *         description: User lacks permission to perform this action.
 *       500:
 *         description: Internal server error.
 */
export async function PATCH(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.formData();
            const article_id = parseInt(data.get("article_id")?.toString() ?? '0');
            const article = data.get("article");
            if (!article) return return_400("article is required");
            const article_json = JSON.parse(article.toString());
            // @ts-ignore
            const files = data.getAll("files") as FileList;

            let user_id = decoded.user_id;
            let user_type = decoded.user_type;

            let title: string = article_json.title?.toString() ?? '';
            let content: string = article_json.content?.toString() ?? '';
            let is_notice: number = parseInt(article_json.is_notice ?? -1);
            let category: number = parseInt(article_json.category ?? -1);
            let subject_id: number = parseInt(article_json.subject_id ?? -1);
            let attach_files: SavedFileList = article_json.attach_files ?? '[]';

            if (!article_id) return return_400("article_id is required");
            if (title && title.length > 255) return return_400("title is too long");
            if (Number.isNaN(is_notice) || is_notice !== 1 && is_notice !== 0 && is_notice !== -1) return return_400("is_notice should be 0 or 1");
            if (is_notice === 1 && user_type < UserType.TEACHER) return return_permission_denied();
            if (Number.isNaN(category)) return return_400("category should be a number");
            if (Number.isNaN(subject_id)) return return_400("subject_id should be a number");

            let [article_] =
                await tx.select()
                    .from(schema.boards)
                    .where(eq(schema.boards.id, article_id))
            if (!article_) return return_400("Article not found");
            if (article_.user_id !== user_id && user_type < UserType.TEACHER) return return_permission_denied();

            let update_data: any = {}
            if (title) update_data['title'] = title;
            if (content) update_data['content'] = content;
            if (is_notice !== -1) update_data['notice'] = is_notice;
            if (category !== -1) update_data['category'] = category;
            if (subject_id !== -1) {
                console.log(article_.class_id);
                let [subject_] =
                    await tx.select()
                        .from(schema.subjects)
                        .where(and(
                            eq(schema.subjects.id, subject_id),
                            eq(schema.subjects.class_id, article_.class_id)
                        ))
                if (!subject_) return return_400("Subject not found");
                update_data['subject_id'] = subject_id;
                // TODO: alert를 새로 만들어야 하는지 확인
            }
            let files_path: SavedFileList = await update_files(tx, files, JSON.parse(article_.attach_files?.toString() ?? '[]'), attach_files);
            if (files_path.length > 0) update_data['attach_files'] = files_path;
            if (article_.attach_files && article_.attach_files != files_path) update_data['attach_files'] = files_path;

            await tx.update(schema.boards)
                .set(update_data)
                .where(eq(schema.boards.id, article_id))

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/board:
 *   delete:
 *     summary: Delete an existing article
 *     description: Deletes an existing article. Only the user who created the article or a teacher can delete it.
 *     tags:
 *       - Board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               article_id:
 *                 type: integer
 *                 description: The ID of the article to be deleted.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Article successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request. Missing or incorrect data.
 *       401:
 *         description: User is not logged in.
 *       403:
 *         description: User lacks permission to perform this action.
 *       404:
 *         description: Article not found.
 *       500:
 *         description: Internal server error.
 */
export async function DELETE(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.json();
            const article_id = parseInt(data.article_id ?? '');
            if (Number.isNaN(article_id)) return return_400("article_id is required");

            let user_id = decoded.user_id;
            let user_type = decoded.user_type;

            let [article] =
                await tx.select()
                    .from(schema.boards)
                    .where(eq(schema.boards.id, article_id))
            if (!article) return return_400("Article not found");
            if (article.user_id !== user_id && user_type < UserType.TEACHER) return return_permission_denied();
            await delete_files(tx, JSON.parse(article.attach_files?.toString() ?? '[]'));

            await tx.delete(schema.boards)
                .where(eq(schema.boards.id, article_id))

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}