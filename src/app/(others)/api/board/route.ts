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
import {save_files} from "@/app/(others)/api/(tools)/files";

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
 *                 description: JSON string containing article information. class_id, title, content is required. <br> Category <br><li> 0 - None <li> 1 - Question <li> 2 - Notice <li> 3 - Homework
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
 *                   due_date:
 *                     type: string
 *                     example: "2022-12-31"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "class_id is required"
 *       401:
 *         description: Unauthorized - User is not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not logged in"
 *       403:
 *         description: Forbidden - User does not have the required permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Permission denied"
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
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
            if (!content) return return_400("content is required");
            if (Number.isNaN(is_notice) || is_notice !== 1 && is_notice !== 0) return return_400("is_notice is required(0 or 1)");
            if (is_notice === 1 && user_type < UserType.TEACHER) return return_permission_denied();
            if (Number.isNaN(category)) return return_400("category is required");
            if (Number.isNaN(subject_id)) return return_400("subject_id is required(number)");

            let [class_] =
                await tx.select({
                    users_count: count(schema.users.uid),
                    subjects_count: count(schema.subjects.id)
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
            if (!class_) return return_400("Class not found");
            if (class_.users_count === 0) return return_permission_denied();
            if (subject_id && class_.subjects_count === 0) return return_400("Subject not found");

            let files_path: string[] = save_files(files);

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
                    attach_files: files_path.length === 0 ? null : JSON.stringify(files_path)
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