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
import {save_files, SavedFileList} from "@/app/(others)/api/(tools)/files";


/**
 * @swagger
 * /api/board/comment:
 *   post:
 *     summary: Add a comment to an article
 *     description: This endpoint allows authenticated users to add a comment to an article, along with optional file attachments.
 *     tags:
 *       - Board
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: object
 *                 description: JSON string containing comment information. article_id, content is required.
 *                 properties:
 *                   article_id:
 *                     type: number
 *                     example: 123
 *                   content:
 *                     type: string
 *                     example: "This is a test comment."
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Attachments for the comment (optional).
 *     responses:
 *       200:
 *         description: Comment added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad Request - Missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "article_id is required"
 *       403:
 *         description: Permission Denied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Permission denied"
 *       500:
 *         description: Server Error.
 */
export async function POST(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.formData();
            const comment = JSON.parse(data.get('comment')?.toString() ?? '{}');
            // @ts-ignore
            const files = data.getAll('files') as FileList;

            let user_id = decoded.user_id;
            let user_type = decoded.user_type;

            let article_id: number = parseInt(comment.article_id) ?? 0;
            let content: string = comment.content.toString() ?? '';

            if (!article_id) return return_400('article_id is required');
            if (!content) return return_400('content is required');

            let [article] =
                await tx.select({
                    board_count: count(schema.boards.id),
                    user_count: count(schema.users.uid),
                })
                    .from(schema.boards)
                    .leftJoin(schema.classes, eq(schema.classes.id, schema.boards.class_id))
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
                    .where(eq(schema.boards.id, article_id))
            if (article.board_count === 0) return return_400('Article not found');
            if (article.user_count === 0 && user_type !== UserType.ADMIN) return return_permission_denied();

            let files_path: SavedFileList = await save_files(tx, files);
            await tx.insert(schema.comments).values({
                article_id: article_id,
                user_id: user_id,
                content: content,
                attach_files: JSON.stringify(files_path)
            });

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}