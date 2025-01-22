import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, count, eq, sql} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {delete_files, save_files, SavedFileList, update_files} from "@/app/(others)/api/(tools)/files";
import {register_alert} from "@/app/(others)/api/(tools)/alerts";


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
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.formData();
            const comment = JSON.parse(data.get('comment')?.toString() ?? '{}');
            // @ts-ignore
            const files = data.getAll('files') as FileList;

            const user_id = decoded.user_id;
            const user_type = decoded.user_type;

            const article_id: number = parseInt(comment.article_id) ?? 0;
            const content: string = comment.content.toString() ?? '';

            if (!article_id) return return_400('article_id is required');
            if (!content) return return_400('content is required');

            const [article] =
                await tx.select({
                    user_id: schema.boards.user_id,
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

            const files_path: SavedFileList = await save_files(tx, files);
            await tx.insert(schema.comments).values({
                article_id: article_id,
                user_id: user_id,
                content: content,
                attach_files: files_path
            });

            await tx.update(schema.boards).set({
                comment_count: sql`${schema.boards.comment_count} + 1`
            })
                .where(eq(schema.boards.id, article_id));

            await register_alert(tx, user_id, `새 댓글이 달렸습니다.\n ${content.substring(0, 20)}`, 0, article_id)

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/board/comment:
 *   patch:
 *     summary: Update a comment
 *     description: Updates an existing comment with new information. Only the user who created the comment or a teacher can update it.
 *     tags:
 *       - Board
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               comment_id:
 *                 type: number
 *                 example: 123
 *               comment:
 *                 type: object
 *                 description: JSON string containing comment information. <br>Attach_files is an array of file paths to attach to the article. This is for remove files by not including them in the array only. If you want to add new files, use the files field.
 *                 properties:
 *                   content:
 *                     type: string
 *                     example: "This is an updated comment."
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
 *     responses:
 *       200:
 *         description: Comment updated successfully.
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
 *                   example: "comment_id is required"
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
export async function PATCH(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.formData();
            const comment_json = JSON.parse(data.get('comment')?.toString() ?? '{}');
            // @ts-ignore
            const files = data.getAll('files') as FileList;

            const user_id = decoded.user_id;
            const user_type = decoded.user_type;

            const comment_id: number = parseInt(data.get('comment_id')?.toString() ?? '0');
            const content: string = comment_json.content.toString() ?? '';
            const attach_files: SavedFileList = comment_json.attach_files ?? [];

            if (!comment_id) return return_400('comment_id is required');

            const [comment] =
                await tx.select()
                    .from(schema.comments)
                    .where(eq(schema.comments.id, comment_id));
            if (!comment) return return_400('Comment not found');
            if (comment.user_id !== user_id && user_type < UserType.TEACHER ) return return_permission_denied();

            const update_data: any = {};
            if (content) update_data.content = content;

            const files_path: SavedFileList = await update_files(tx, files, JSON.parse(comment.attach_files?.toString() ?? '[]'), attach_files);
            if (files_path.length) update_data['attach_files'] = files_path;
            if (comment.attach_files && comment.attach_files != files_path) update_data['attach_files'] = files_path;

            await tx.update(schema.comments)
                .set(update_data)
                .where(eq(schema.comments.id, comment_id));

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/board/comment:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes an existing comment. Only the user who created the comment or a teacher can delete it.
 *     tags:
 *       - Board
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment_id:
 *                 type: number
 *                 example: 123
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
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
 *                   example: "comment_id is required"
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
export async function DELETE(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.json();
            const comment_id = parseInt(data.comment_id ?? '');
            if (Number.isNaN(comment_id)) return return_400("comment_id is required");

            const user_id = decoded.user_id;
            const user_type = decoded.user_type;

            const [comment] =
                await tx.select()
                    .from(schema.comments)
                    .where(eq(schema.comments.id, comment_id))
            if (!comment) return return_400("Comment not found");
            if (comment.user_id !== user_id && user_type < UserType.TEACHER) return return_permission_denied();
            await delete_files(tx, JSON.parse(comment.attach_files?.toString() ?? '[]'));

            await tx.delete(schema.comments)
                .where(eq(schema.comments.id, comment_id))

            await tx.update(schema.boards)
                .set({
                    comment_count: sql`${schema.boards.comment_count} - 1`
                })
                .where(eq(schema.boards.id, comment.article_id));

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}