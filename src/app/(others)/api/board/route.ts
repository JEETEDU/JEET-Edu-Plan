import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, asc, count, desc, eq, like, or, SQL, sql} from 'drizzle-orm';
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
import {AlertType, register_alert, register_alert_for_class} from "@/app/(others)/api/(tools)/alerts";
import {ArticleCategory} from "@/app/(others)/api/board/tools";

/**
 * @swagger
 * /api/board:
 *   post:
 *     summary: Create a new article in the system
 *     description: Validates the user's token, processes form data, and creates a new article for the specified class and subject. You cannot create a homework article using this endpoint. Use the homework endpoint instead.
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
 *                 description: JSON string containing article information. class_id, title, content is required. <br> Category <br><li> 0 - Normal <li> 1 - Homework(Cannot use in this endpoints. Use the homework endpoints) <li> 2 - Question <li> 3 - Data
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
            if (ArticleCategory[category] === undefined) return return_400("Invalid category");
            if (category === ArticleCategory.HOMEWORK) return return_400("Cannot create homework article");
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
                    comment_count: 0,
                    attach_files: files_path.length === 0 ? null : files_path
                }
            ).$returningId();

            if (category === ArticleCategory.QUESTION && subject_id) {
                let [subject_] =
                    await tx.select({
                        teacher_id: schema.teacherClasses.user_id
                    })
                        .from(schema.teacherClasses)
                        .where(and(
                            eq(schema.teacherClasses.subject_id, subject_id),
                            eq(schema.teacherClasses.class_id, class_id)
                        ))
                if (!subject_.teacher_id) return return_400("Teacher not found");
                await register_alert(tx, subject_.teacher_id, `새 질문이 등록되었습니다.\n${title}`, AlertType.NORMAL, article_id.id);
            }

            if (is_notice === 1) {
                await register_alert_for_class(tx, class_id, `새 공지사항이 등록되었습니다.\n${title}`, AlertType.NOTICE, article_id.id);
            }

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
 * /api/board:
 *   patch:
 *     summary: Update an existing article
 *     description: Updates an existing article with new information. Only the user who created the article or a teacher can update it. You cannot update homework articles. If you want to update homework articles, you must use the homework API.
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
 *                 description: Attachments to add for the comment (optional).
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
            const article = data.get("article") ?? '{}';
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
            let attach_files: SavedFileList = article_json.attach_files ?? [];

            if (!article_id) return return_400("article_id is required");
            if (title && title.length > 255) return return_400("title is too long");
            if (Number.isNaN(is_notice) || is_notice !== 1 && is_notice !== 0 && is_notice !== -1) return return_400("is_notice should be 0 or 1");
            if (is_notice === 1 && user_type < UserType.TEACHER) return return_permission_denied();
            if (Number.isNaN(category)) return return_400("category should be a number");
            if (ArticleCategory[category] === undefined) return return_400("Invalid category");
            if (category === ArticleCategory.HOMEWORK) return return_400("Cannot update into homework category");
            if (Number.isNaN(subject_id)) return return_400("subject_id should be a number");

            let [article_] =
                await tx.select()
                    .from(schema.boards)
                    .where(eq(schema.boards.id, article_id));
            if (!article_) return return_400("Article not found");
            if (article_.user_id !== user_id && user_type < UserType.TEACHER) return return_permission_denied();
            if (article_.category === ArticleCategory.HOMEWORK) return return_400("Cannot update homework article");

            let update_data: any = {}
            if (title) update_data['title'] = title;
            if (content) update_data['content'] = content;
            if (is_notice !== -1) update_data['notice'] = is_notice;
            if (category !== -1) update_data['category'] = category;
            if (subject_id !== -1) {
                console.log(article_.class_id);
                let [subject_] =
                    await tx.select({
                        subject_id: schema.subjects.id,
                        teacher_id: schema.teacherClasses.user_id
                    })
                        .from(schema.subjects)
                        .leftJoin(
                            schema.teacherClasses,
                            eq(schema.teacherClasses.subject_id, schema.subjects.id)
                        )
                        .where(and(
                            eq(schema.subjects.id, subject_id),
                            eq(schema.subjects.class_id, article_.class_id)
                        ))
                if (!subject_) return return_400("Subject not found");
                update_data['subject_id'] = subject_id;
                if(category === ArticleCategory.QUESTION && subject_.teacher_id) {
                    await register_alert(tx, subject_.teacher_id, `새 질문이 등록되었습니다.\n${title}`, AlertType.NORMAL, article_id);
                }
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
 *     description: Deletes an existing article. Only the user who created the article or a teacher can delete it. You cannot delete homework articles. If you want to delete a homework article, use the homework API.
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
            if (article.category === ArticleCategory.HOMEWORK) return return_400("Cannot delete homework article");
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


/**
 * @swagger
 * /api/board:
 *   get:
 *     summary: Retrieve articles
 *     description: Retrieves a list of articles based on filters such as class, subject, category, and more. Pagination is supported.
 *     tags:
 *       - Board
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           description: The number of articles per page.
 *       - in: query
 *         name: class_id
 *         required: true
 *         schema:
 *           type: integer
 *           description: The ID of the class to retrieve articles for.
 *       - in: query
 *         name: subject_id
 *         required: false
 *         schema:
 *           type: integer
 *           description: Filter articles by the subject ID.
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: integer
 *           description: Filter articles by their category (-1 or empty means no filter).
 *       - in: query
 *         name: search_by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [title, title_content, author]
 *           description: Search criteria.
 *       - in: query
 *         name: search_string
 *         required: false
 *         schema:
 *           type: string
 *           description: The search string to match with the given search criterion.
 *       - in: query
 *         name: order_by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at]
 *           description: Field to order the articles by.
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *           description: Sort order for the articles.
 *     responses:
 *       200:
 *         description: Successfully retrieved articles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       create_time:
 *                         type: string
 *                         format: date-time
 *                       update_time:
 *                         type: string
 *                         format: date-time
 *                       attach_files_exist:
 *                         type: boolean
 *                       category:
 *                         type: integer
 *                       notice:
 *                         type: boolean
 *                       due_date:
 *                         type: string
 *                         format: date-time
 *                       comment_count:
 *                         type: integer
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       subject:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *       400:
 *         description: Bad request. Missing or invalid query parameters.
 *       401:
 *         description: User is not authenticated.
 *       403:
 *         description: User does not have permission to retrieve the articles.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        let decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const data = req.nextUrl.searchParams;
        const page = parseInt(data.get("page") ?? '1');
        const limit = parseInt(data.get("limit") ?? '10');
        const class_id = parseInt(data.get("class_id") ?? '0');
        const subject_id = parseInt(data.get("subject_id") ?? '0');
        const category = parseInt(data.get("category") ?? '-1');
        const search_by = data.get("search_by") ?? '';
        const search_string = data.get("search_string") ?? '';
        const order_by = data.get("order_by") ?? 'created_at';
        const order = (data.get('order') ?? 'DESC').toUpperCase();

        if (Number.isNaN(page) || page < 1) return return_400("Invalid page number");
        if (Number.isNaN(limit) || limit < 1) return return_400("Invalid limit number");
        if (Number.isNaN(class_id) || class_id < 1) return return_400("Invalid class_id");

        let user_id = decoded.user_id;
        let user_type = decoded.user_type;

        // check permission
        let [class_] =
            await db.select({
                class_count: count(schema.classes.id),
                user_count: count(schema.users.uid)
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
                .where(eq(schema.classes.id, class_id))
        if (class_.class_count === 0) return return_400("Class not found");
        if (class_.user_count === 0 && user_type !== UserType.ADMIN) return return_permission_denied();

        let queryBuilder: QueryBuilder = new QueryBuilder();
        let query = queryBuilder.select({
            id: schema.boards.id,
            title: schema.boards.title,
            content: schema.boards.content,
            create_time: schema.boards.create_time,
            update_time: schema.boards.update_time,
            attach_files_exist: sql`IF(attach_files IS NULL, 0, 1) as attach_files_exist`,
            category: schema.boards.category,
            notice: schema.boards.notice,
            due_date: schema.boards.due_date,
            comment_count: schema.boards.comment_count,
            user: {
                id: sql`${schema.users.uid} as user_id`,
                name: sql`${schema.users.name} as user_name`,
            },
            subject: {
                id: sql`${schema.subjects.id} as subject_id`,
                name: sql`${schema.subjects.name} as subject_name`,
            }
        })
            .from(schema.boards)
            .leftJoin(
                schema.users,
                eq(schema.boards.user_id, schema.users.uid)
            )
            .leftJoin(
                schema.subjects,
                eq(schema.boards.subject_id, schema.subjects.id)
            )
            .$dynamic();

        let where_clause: SQL | undefined = eq(schema.boards.class_id, class_id);
        if (subject_id) where_clause = and(where_clause, eq(schema.boards.subject_id, subject_id));
        if (category !== -1) where_clause = and(where_clause, eq(schema.boards.category, category));
        if (search_by && search_string) {
            if (search_by === 'title') where_clause = and(where_clause, like(schema.boards.title, `%${search_string}%`));
            else if (search_by === 'title_content') {
                where_clause = and(where_clause, or(
                    like(schema.boards.title, `%${search_string}%`),
                    like(schema.boards.content, `%${search_string}%`)
                ));
            }
            else if (search_by === 'author') where_clause = and(where_clause, like(schema.users.name, `%${search_string}%`));
            else return return_400("Invalid search_by");
        }
        query = query.where(where_clause);

        if (order_by && order) {
            let order_func = asc;
            if (order == 'ASC') {
                order_func = asc;
            }
            else if (order == 'DESC') {
                order_func = desc;
            }
            else {
                return return_400('Invalid order');
            }

            if (order_by === 'created_at') {
                query = query.orderBy(order_func(schema.boards.create_time));
            }
            else if (order_by === 'updated_at') {
                query = query.orderBy(order_func(schema.boards.update_time));
            }
            else {
                return return_400('Invalid order_by');
            }
        }
        query = query.limit(limit).offset((page - 1) * limit);

        let [articles] = await db.execute(query);
        console.log(articles);
        return NextResponse.json({
            success: true,
            // @ts-ignore
            articles: articles?.map((article: any) => {
                return {
                    id: article.id,
                    title: article.title,
                    content: article.content,
                    create_time: article.create_time,
                    update_time: article.update_time,
                    attach_files_exist: article.attach_files_exist,
                    category: article.category,
                    notice: article.notice,
                    due_date: article.due_date,
                    comment_count: article.comment_count,
                    user: {
                        id: article.user_id,
                        name: article.user_name,
                    },
                    subject: {
                        id: article.subject_id,
                        name: article.subject_name,
                    }
                }
            })
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}