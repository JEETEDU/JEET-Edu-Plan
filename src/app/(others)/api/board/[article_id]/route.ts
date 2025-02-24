import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, asc, count, eq, sql} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";

/**
 * @swagger
 * /api/board/{article_id}:
 *   get:
 *     summary: Get an article by its id
 *     description: Get an article by its id
 *     tags:
 *       - Board
 *     parameters:
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The id of the article to retrieve.
 *     responses:
 *       200:
 *         description: The article has been retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 article:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     class_id:
 *                       type: integer
 *                     create_time:
 *                       type: string
 *                     update_time:
 *                       type: string
 *                     attach_files_exist:
 *                       type: integer
 *                     category:
 *                       type: integer
 *                     notice:
 *                       type: integer
 *                     due_date:
 *                       type: string
 *                     comment_count:
 *                       type: integer
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         user_type:
 *                           type: integer
 *                     subject:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     attach_files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "file1.jpg"
 *                           path:
 *                             type: string
 *                             example: "/file/file1.jpg"
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       user_name:
 *                         type: string
 *                       content:
 *                         type: string
 *                       create_time:
 *                         type: string
 *                       update_time:
 *                         type: string
 *                       attach_files:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             path:
 *                               type: string
 *       400:
 *         description: Article not found or invalid request.
 *       401:
 *         description: Unauthorized. User is not logged in or token is invalid.
 *       403:
 *         description: Permission denied. User is not authorized to access the article.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ article_id: string }> }) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        const decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const article_id = parseInt((await params).article_id);
        if (isNaN(article_id)) return return_400('Invalid article id');

        const user_id = decoded.user_id;
        const user_type = decoded.user_type;

        const [article] =
            await db.select({
                id: schema.boards.id,
                class_id: schema.boards.class_id,
                title: schema.boards.title,
                content: schema.boards.content,
                create_time: schema.boards.create_time,
                update_time: schema.boards.update_time,
                attach_files_exist: sql`IF(attach_files IS NULL, 0, 1) as attach_files_exist`,
                attach_files: schema.boards.attach_files,
                category: schema.boards.category,
                notice: schema.boards.notice,
                due_date: schema.boards.due_date,
                comment_count: schema.boards.comment_count,
                user_id: sql`${schema.users.uid} as user_id`,
                user_name: sql`${schema.users.name} as user_name`,
                user_type: schema.users.user_type,
                subject_id: sql`${schema.subjects.id} as subject_id`,
                subject_name: sql`${schema.subjects.name} as subject_name`,
                user_class_count: count(user_type === UserType.STUDENT ? schema.studentClasses.class_id : schema.teacherClasses.class_id)
            })
                .from(schema.boards)
                .leftJoin(
                        user_type === UserType.STUDENT ? schema.studentClasses : schema.teacherClasses,
                        and(
                            eq((user_type === UserType.STUDENT ? schema.studentClasses : schema.teacherClasses).class_id, schema.boards.class_id),
                            eq((user_type === UserType.STUDENT ? schema.studentClasses : schema.teacherClasses).user_id, user_id)
                        )
                    )
                .leftJoin(schema.users, eq(schema.boards.user_id, schema.users.uid))
                .leftJoin(schema.subjects, eq(schema.boards.subject_id, schema.subjects.id))
                .where(eq(schema.boards.id, article_id));
        if (!article.id) return return_400('Article not found');
        if (user_type !== UserType.ADMIN && article.user_class_count === 0) return return_permission_denied();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        article.attach_files = article.attach_files ? JSON.parse(article.attach_files) : [];

        const comments = await db.select({
            id: schema.comments.id,
            user_id: schema.comments.user_id,
            user_name: sql`${schema.users.name} as user_name`,
            content: schema.comments.content,
            attach_files: schema.comments.attach_files,
            create_time: schema.comments.create_time,
            update_time: schema.comments.update_time
        })
            .from(schema.comments)
            .leftJoin(schema.users, eq(schema.comments.user_id, schema.users.uid))
            .where(eq(schema.comments.article_id, article_id))
            .orderBy(asc(schema.comments.create_time));

        return NextResponse.json({
            success: true,
            article: {
                id: article.id,
                title: article.title,
                content: article.content,
                class_id: article.class_id,
                create_time: new Date(article.create_time),
                update_time: new Date(article.update_time),
                attach_files_exist: article.attach_files_exist,
                attach_files: article.attach_files,
                category: article.category,
                is_notice: article.notice,
                due_date: article.due_date ? new Date(article.due_date) : null,
                comment_count: article.comment_count,
                user: {
                    id: article.user_id,
                    name: article.user_name,
                    user_type: article.user_type
                },
                subject: {
                    id: article.subject_id,
                    name: article.subject_name
                }
            },
            comments: comments.map((comment) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                comment.attach_files = comment.attach_files ? JSON.parse(comment.attach_files) : [];
                return comment;
            })
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}