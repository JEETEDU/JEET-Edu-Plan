import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, asc, desc, eq, like, SQL} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied, todayString,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {verifyToken} from "@/app/(others)/api/(tools)/auth";
import {QueryBuilder} from "drizzle-orm/mysql-core";

/**
 * @swagger
 * /api/admin/today/response:
 *   get:
 *     security:
 *       - cookieAuth: []
 *     summary: Get today's user responses
 *     description: <b>Admin</b><br>Get user responses of one day. If date is not provided, it will get today's responses.
 *     tags:
 *       - Admin/Today
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *           example: 1
 *         description: Page number
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *           example: 10
 *         description: Number of items per page
 *         required: false
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2023-10-01"
 *         description: Date in YYYY-MM-DD format
 *         required: false
 *       - in: query
 *         name: search_by
 *         schema:
 *           type: string
 *           example: "name"
 *           enum: ["user_id", "user_type", "name", "first_year", "school", "joined_term"]
 *         description: Search by field
 *         required: false
 *       - in: query
 *         name: search_string
 *         schema:
 *           type: string
 *           example: "john"
 *         description: Search string
 *         required: false
 *       - in: query
 *         name: order_by
 *         schema:
 *           type: string
 *           example: "name"
 *           enum: ["user_type", "name", "first_year", "school", "joined_term"]
 *           default: "name"
 *         description: Order by field
 *         required: false
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           example: "ASC"
 *         description: Order (ASC or DESC)
 *         required: false
 *     responses:
 *       200:
 *         description: List of user responses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 responses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           uid:
 *                             type: number
 *                             example: 1
 *                           login_id:
 *                             type: string
 *                             example: "john123"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           first_year:
 *                             type: number
 *                             example: 2021
 *                           school:
 *                             type: string
 *                             example: "School of Computing"
 *                           joined_term:
 *                             type: string
 *                             example: "2021 Spring"
 *                       sleep:
 *                         type: object
 *                         properties:
 *                           sleep:
 *                             type: string
 *                             example: "22:00"
 *                           wakeup:
 *                             type: string
 *                             example: "06:00"
 *                 questions:
 *                   type: object
 *                   properties:
 *                     question_1:
 *                       type: string
 *                       example: "How was your day?"
 *                     question_2:
 *                       type: string
 *                       example: "What did you do today?"
 *                     question_3:
 *                       type: string
 *                       example: "What are you planning to do tomorrow?"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "error message"
 *       401:
 *         description: Not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "error message"
 *       403:
 *         description: Permission denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "error message"
 */
export async function GET(req: NextRequest) {
    try {
        const token: string = req.cookies.get("token")?.value ?? '';
        if (token) {
            const decoded = verifyToken(token);
            if (!decoded) { // invalid token
                return return_not_logged_in();
            }
            if (decoded.user_type < UserType.ADMIN) { // not admin
                return return_permission_denied();
            }
        } else { // not logged in
            return return_not_logged_in();
        }

        const data = req.nextUrl.searchParams;
        const page = data.get('page') ?? '1';
        const limit = data.get('limit') ?? '10';
        let date: string | SQL = data.get('date') ?? '';
        const search_by = data.get('search_by') ?? '';
        const search_string = data.get('search_string') ?? '';
        const order_by = data.get('order_by') ?? 'name';
        const order = data.get('order') ?? 'ASC';

        if (isNaN(parseInt(page))) {
            return return_400('Invalid page');
        }
        if (isNaN(parseInt(limit))) {
            return return_400('Invalid limit');
        }

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (date) {
            if (!datePattern.test(date)) {
                return return_400('Invalid date format');
            }
        }
        else date = todayString();

        const queryBuilder = new QueryBuilder();
        let query =
            queryBuilder.select({
                user: schema.users,
                sleep: schema.sleeps,
                answers: schema.todayAnswers
            })
                .from(schema.users)
                .leftJoin(schema.sleeps, and(
                    eq(schema.users.uid, schema.sleeps.user_id),
                    // @ts-ignore
                    eq(schema.sleeps.date, date))
                )
                .leftJoin(schema.todayAnswers, eq(schema.users.uid, schema.todayAnswers.user_id))
                .$dynamic();

        let where_clause;
        if (search_by && search_string) {
            if (search_by == 'user_id') {
                where_clause = eq(schema.users.uid, parseInt(search_string));
            } else if (search_by == 'user_type') {
                where_clause = eq(schema.users.user_type, parseInt(search_string));
            } else if (search_by == 'name') {
                where_clause = like(schema.users.name, `%${search_string}%`);
            } else if (search_by == 'first_year') {
                where_clause = eq(schema.users.first_year, parseInt(search_string));
            } else if (search_by == 'school') {
                where_clause = like(schema.users.school, `%${search_string}%`);
            } else if (search_by == 'joined_term') {
                where_clause = like(schema.users.joined_term, `%${search_string}%`);
            } else {
                return return_400('Invalid search_by');
            }
        }
        // @ts-ignore
        if (where_clause) query = query.where(and(where_clause, eq(schema.todayAnswers.date, date)));
        // @ts-ignore
        else query = query.where(eq(schema.todayAnswers.date, date));

        if (order_by && order) {
            let order_func = asc;
            if (order == 'ASC') {
                order_func = asc;
            } else if (order == 'DESC') {
                order_func = desc;
            } else {
                return return_400('Invalid order');
            }

            if (order_by == 'user_type') {
                query = query.orderBy(order_func(schema.users.user_type));
            } else if (order_by == 'name') {
                query = query.orderBy(order_func(schema.users.name));
            } else if (order_by == 'first_year') {
                query = query.orderBy(order_func(schema.users.first_year));
            } else if (order_by == 'school') {
                query = query.orderBy(order_func(schema.users.school));
            } else if (order_by == 'joined_term') {
                query = query.orderBy(order_func(schema.users.joined_term));
            } else {
                return return_400('Invalid order_by');
            }
        }
        query = query.limit(parseInt(limit)).offset((parseInt(page) - 1) * parseInt(limit));

        const [result] = await db.execute(query);

        console.debug(query.toSQL());

        const [question] =
            await db.select()
                .from(schema.todayQuestions)
                .where(
                    // @ts-ignore
                    eq(schema.todayQuestions.date, date ? date : todayString())
                );

        return NextResponse.json({
            success: true,
            // @ts-ignore
            responses: result.map((user: any) => {
                return {
                    user: {
                        uid: user.uid,
                        login_id: user.login_id,
                        name: user.name,
                        first_year: user.first_year,
                        school: user.school,
                        joined_term: user.joined_term
                    },
                    sleep: {
                        sleep: user.sleep ? new Date(user.sleep) : null,
                        wakeup: user.wakeup ? new Date(user.wakeup) : null
                    },
                    answers: {
                        answer_1: user.answer_1,
                        answer_2: user.answer_2,
                        answer_3: user.answer_3,
                        answer_lastday: user.answer_lastday,
                        answer_school: user.answer_school,
                        answer_academy: user.answer_academy
                    }
                }
            }),
            questions: {
                question_1: question?.question_1,
                question_2: question?.question_2,
                question_3: question?.question_3
            }
        }, {status: 200});
    } catch (e) {
        console.error(e);
        return return_500();
    }
}