import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, desc, eq, sql} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";


/**
 * @swagger
 * /api/user/notice:
 *   get:
 *     summary: Retrieve paginated list of notices
 *     description: Fetches a paginated list of notices for a user.
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The current page of results to fetch.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items to fetch per page.
 *     responses:
 *       200:
 *         description: Successfully retrieved the notices.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 notices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
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
 *                         type: string
 *                       notice:
 *                         type: boolean
 *                       due_date:
 *                         type: string
 *                         format: date-time
 *                       comment_count:
 *                         type: integer
 *                       class_:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       subject:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *       400:
 *         description: Invalid or missing parameters.
 *       401:
 *         description: User not logged in.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        const decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const data = req.nextUrl.searchParams;
        const page = parseInt(data.get('page') ?? '1');
        const limit = parseInt(data.get('limit') ?? '10');
        if (isNaN(page)) return return_400('Invalid page');
        if (isNaN(limit)) return return_400('Invalid limit');

        const user_id = decoded.user_id;
        const user_type = decoded.user_type;

        const link_table = user_type === UserType.STUDENT ? schema.studentClasses : schema.teacherClasses;
        const notices =
            await db.select({
                id: schema.boards.id,
                title: schema.boards.title,
                create_time: schema.boards.create_time,
                update_time: schema.boards.update_time,
                attach_files_exist: sql`IF(attach_files IS NULL, 0, 1)`.as('attach_files_exist'),
                category: schema.boards.category,
                notice: schema.boards.notice,
                due_date: schema.boards.due_date,
                comment_count: schema.boards.comment_count,
                class_: {
                    id: link_table.class_id,
                    name: sql`${schema.classes.name}`.as('class_name')
                },
                user: {
                    id: sql`${schema.users.uid}`.as('user_id'),
                    name: sql`${schema.users.name}`.as('user_name'),
                },
                subject: {
                    id: sql`${schema.subjects.id}`.as('subject_id'),
                    name: sql`${schema.subjects.name}`.as('subject_name'),
                }
            })
                .from(schema.boards)
                .leftJoin(
                    link_table,
                    eq(link_table.class_id, schema.boards.class_id)
                )
                .leftJoin(
                    schema.classes,
                    eq(schema.classes.id, schema.boards.class_id)
                )
                .leftJoin(
                    schema.users,
                    eq(schema.boards.user_id, schema.users.uid)
                )
                .leftJoin(
                    schema.subjects,
                    eq(schema.boards.subject_id, schema.subjects.id)
                )
                .where(
                    and(
                        eq(schema.boards.notice, 1),
                        eq(link_table.user_id, user_id)
                    )
                )
                .limit(limit)
                .offset((page - 1) * limit)
                .orderBy(desc(schema.boards.create_time));

        return NextResponse.json({
            success: true,
            notices: notices.map((notice: any) => {
                return {
                    id: notice.id,
                    title: notice.title,
                    create_time: notice.create_time,
                    update_time: notice.update_time,
                    attach_files_exist: notice.attach_files_exist,
                    category: notice.category,
                    notice: notice.notice,
                    due_date: notice.due_date,
                    comment_count: notice.comment_count,
                    class_: {
                        id: notice.class_.id,
                        name: notice.class_.name,
                    },
                    user: {
                        id: notice.user.id,
                        name: notice.user.name,
                    },
                    subject: {
                        id: notice.subject.id,
                        name: notice.subject.name,
                    }
                }
            })
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}