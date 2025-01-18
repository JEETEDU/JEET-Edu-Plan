import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, asc, count, desc, eq, gt, gte, like, lte, or, SQL, sql} from 'drizzle-orm';
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
 * /api/user/homework:
 *   get:
 *     summary: Retrieve homeworks
 *     description: This endpoint retrieves a paginated list of homeworks for a student based on various filters like completion status, dates, class, and subject.
 *     tags:
 *       - Homework
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page.
 *       - in: query
 *         name: done
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter by homework completion status. -1 for all, 0 for incomplete, 1 for completed.
 *       - in: query
 *         name: date_after
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by homeworks due after the specified date.
 *       - in: query
 *         name: date_before
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by homeworks due before the specified date.
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filter by class ID.
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filter by subject ID.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of homeworks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 homeworks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       article_id:
 *                         type: integer
 *                         example: 123
 *                       due_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T10:00:00Z"
 *                       done:
 *                         type: boolean
 *                         example: false
 *                       title:
 *                         type: string
 *                         example: "Math Homework"
 *                       subject:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Mathematics"
 *                           id:
 *                             type: integer
 *                             example: 1
 *                       class_:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Grade 10"
 *                           id:
 *                             type: integer
 *                             example: 101
 *       400:
 *         description: Invalid request parameters.
 *       401:
 *         description: User is not logged in.
 *       403:
 *         description: Permission denied for the user type.
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        let decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const user_id = decoded.user_id;
        const user_type = decoded.user_type;
        if(user_type !== UserType.STUDENT) return return_permission_denied();

        const data = req.nextUrl.searchParams;
        const page = parseInt(data.get('page') ?? '1');
        const limit = parseInt(data.get('limit') ?? '10');
        const done = parseInt(data.get('done') ?? '-1');
        const date_before = data.get('date_before') ?? '';
        const date_after = data.get('date_after') ?? '';
        const class_id = parseInt(data.get('class_id') ?? '0');
        const subject_id = parseInt(data.get('subject_id') ?? '0');

        if(Number.isNaN(done) || done < -1 || done > 1) return return_400("Invalid value for 'done'.");
        if(date_after && !check_date_string(date_after)) return return_400("Invalid date format for 'date_after'.");
        if(date_before && !check_date_string(date_before)) return return_400("Invalid date format for 'date_before'.");
        if(Number.isNaN(class_id) || class_id < 0) return return_400("Invalid value for 'class_id'.");
        if(Number.isNaN(subject_id) || subject_id < 0) return return_400("Invalid value for 'subject_id'.");

        let query = (new QueryBuilder())
            .select({
                article_id: schema.homeworks.article_id,
                due_date: schema.homeworks.due_date,
                done: schema.homeworks.done,
                title: schema.homeworks.title,
                subject: {
                    name: sql`${schema.subjects.name}`.as('subject_name'),
                    subject_id: sql`${schema.subjects.id}`.as('subject_id')
                },
                class_: {
                    name: sql`${schema.classes.name}`.as('class_name'),
                    class_id: sql`${schema.classes.id}`.as('class_id')
                }
            })
            .from(schema.homeworks)
            .leftJoin(
                schema.subjects,
                eq(schema.homeworks.subject_id, schema.subjects.id)
            )
            .leftJoin(
                schema.classes,
                eq(schema.homeworks.class_id, schema.classes.id)
            )
            .$dynamic();
        let where_clause: SQL<any> | undefined = eq(schema.homeworks.user_id, user_id);
        if(done !== -1) where_clause = and(where_clause, eq(schema.homeworks.done, done));
        if(date_after) where_clause = and(where_clause, gte(schema.homeworks.due_date, new Date(date_after)));
        if(date_before) where_clause = and(where_clause, lte(schema.homeworks.due_date, new Date(date_before)));
        if(class_id) where_clause = and(where_clause, eq(schema.homeworks.class_id, class_id));
        if(subject_id) where_clause = and(where_clause, eq(schema.homeworks.subject_id, subject_id));
        query = query.where(where_clause).limit(limit).offset((page - 1) * limit);

        let [homeworks] = await db.execute(query);

        return NextResponse.json({
            success: true,
            // @ts-ignore
            homeworks: homeworks?.map((h) => ({
                article_id: h.article_id,
                due_date: h.due_date,
                done: h.done,
                title: h.title,
                subject: {
                    name: h.subject_name,
                    id: h.subject_id
                },
                class_: {
                    name: h.class_name,
                    id: h.class_id
                }
            }))
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}