import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import {and, eq, gte, isNotNull, lte, SQL, sql} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied, to_date_string, to_time_string, UserType
} from "@/app/(others)/api/(tools)/tools";
import {verifyToken} from "@/app/(others)/api/(tools)/auth";
import {QueryBuilder} from "drizzle-orm/mysql-core";
import {Workbook} from "exceljs";


/**
 * @swagger
 * /api/admin/today/response/excel:
 *   get:
 *     summary: Generate an Excel file with user sleep and answer data
 *     description: Returns an Excel file containing user data, including sleep records, answers, and other user details for a specific date range.
 *     tags:
 *       - Admin/Today
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The start date for filtering records (YYYY-MM-DD).
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: The end date for filtering records (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: An Excel file containing the requested user data.
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid input (e.g., incorrect date format).
 *       401:
 *         description: User not logged in.
 *       403:
 *         description: Access forbidden (user does not have sufficient permissions).
 *       500:
 *         description: Internal server error.
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        const decoded = verifyToken(token);
        if (!decoded) return return_not_logged_in();
        if (decoded.user_type !== UserType.ADMIN) return return_permission_denied();

        const data = req.nextUrl.searchParams;
        const start_date: string | SQL = data.get('start_date') ?? '';
        const end_date: string | SQL = data.get('end_date') ?? '';

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (start_date && !datePattern.test(start_date)) return return_400("Invalid date format for 'start_date'.");
        if (end_date && !datePattern.test(end_date)) return return_400("Invalid date format for 'end_date'.");

        const sub_table = db.select({
            user_id: schema.users.uid,
            user_type: schema.users.user_type,
            name: schema.users.name,
            first_year: schema.users.first_year,
            school: schema.users.school,
            joined_term: schema.users.joined_term,
            date: sql`COALESCE(${schema.sleeps.date}, ${schema.todayAnswers.date})`.as('date'),
            sleep: schema.sleeps.sleep,
            wakeup: schema.sleeps.wakeup,
            answer_1: schema.todayAnswers.answer_1,
            answer_2: schema.todayAnswers.answer_2,
            answer_3: schema.todayAnswers.answer_3,
            answer_lastday: schema.todayAnswers.answer_lastday,
            answer_school: schema.todayAnswers.answer_school,
            answer_academy: schema.todayAnswers.answer_academy
        })
            .from(schema.users)
            .leftJoin(schema.sleeps, eq(schema.users.uid, schema.sleeps.user_id))
            .leftJoin(schema.todayAnswers, and(
                eq(schema.users.uid, schema.todayAnswers.user_id),
                eq(schema.sleeps.date, schema.todayAnswers.date))
            )
            .union(
                (new QueryBuilder()).select({
                    user_id: schema.users.uid,
                    user_type: schema.users.user_type,
                    name: schema.users.name,
                    first_year: schema.users.first_year,
                    school: schema.users.school,
                    joined_term: schema.users.joined_term,
                    date: sql`COALESCE(${schema.sleeps.date}, ${schema.todayAnswers.date})`.as('date'),
                    sleep: schema.sleeps.sleep,
                    wakeup: schema.sleeps.wakeup,
                    answer_1: schema.todayAnswers.answer_1,
                    answer_2: schema.todayAnswers.answer_2,
                    answer_3: schema.todayAnswers.answer_3,
                    answer_lastday: schema.todayAnswers.answer_lastday,
                    answer_school: schema.todayAnswers.answer_school,
                    answer_academy: schema.todayAnswers.answer_academy
                })
                    .from(schema.users)
                    .leftJoin(schema.todayAnswers, eq(schema.users.uid, schema.todayAnswers.user_id))
                    .leftJoin(schema.sleeps, and(
                        eq(schema.users.uid, schema.sleeps.user_id),
                        eq(schema.todayAnswers.date, schema.sleeps.date))
                    ).$dynamic()
            ).as('sub_table');
        let query = (new QueryBuilder()).select({
            user_id: sub_table.user_id,
            user_type: sub_table.user_type,
            name: sub_table.name,
            first_year: sub_table.first_year,
            school: sub_table.school,
            joined_term: sub_table.joined_term,
            date: sql`sub_table.date`,
            sleep: sub_table.sleep,
            wakeup: sub_table.wakeup,
            answer_1: sub_table.answer_1,
            answer_2: sub_table.answer_2,
            answer_3: sub_table.answer_3,
            answer_lastday: sub_table.answer_lastday,
            answer_school: sub_table.answer_school,
            answer_academy: sub_table.answer_academy,
            questions: {
                question_date: sql`${schema.todayQuestions.date}`.as('question_date'),
                question_1: schema.todayQuestions.question_1,
                question_2: schema.todayQuestions.question_2,
                question_3: schema.todayQuestions.question_3
            }
        })
                .from(sub_table)
                .leftJoin(schema.todayQuestions, eq(sql`sub_table.date`, schema.todayQuestions.date))
                .$dynamic();

        let where_clause = and(
            eq(sub_table.user_type, UserType.STUDENT),
            isNotNull(sql`sub_table.date`)
        );
        // @ts-ignore
        if (start_date) where_clause = and(where_clause, gte(sql`sub_table.date`, start_date));
        // @ts-ignore
        if (end_date) where_clause = and(where_clause, lte(sql`sub_table.date`, end_date));
        query = query.where(where_clause);

        const [result] = await db.execute(query);

        const workbook = new Workbook();
        const sheet = workbook.addWorksheet('Sheet1');
        sheet.columns = [
            {header: '날짜', key: 'date'},
            {header: 'User ID', key: 'uid'},
            {header: '이름', key: 'name'},
            {header: '중학교 입학년도', key: 'first_year'},
            {header: '학교', key: 'school'},
            {header: '가입 학기', key: 'joined_term'},
            {header: '수면 시각', key: 'sleep'},
            {header: '기상 시각', key: 'wakeup'},
            {header: '질문 1', key: 'question_1'},
            {header: '답 1', key: 'answer_1'},
            {header: '질문 2', key: 'question_2'},
            {header: '답 2', key: 'answer_2'},
            {header: '질문 3', key: 'question_3'},
            {header: '답 3', key: 'answer_3'},
            {header: '어제 한 일', key: 'answer_lastday'},
            {header: '학교 숙제', key: 'answer_school'},
            {header: '학원 숙제', key: 'answer_academy'},
        ];
        // @ts-ignore
        result.forEach((r) => {
            sheet.addRow({
                date: r.date ? to_date_string(new Date(r.date)) : '',
                uid: r.uid,
                name: r.name,
                first_year: r.first_year,
                school: r.school,
                joined_term: r.joined_term,
                sleep: r.sleep ? to_time_string(new Date(r.sleep)) : '',
                wakeup: r.sleep ? to_time_string(new Date(r.wakeup)) : '',
                answer_1: r.answer_1,
                answer_2: r.answer_2,
                answer_3: r.answer_3,
                answer_lastday: r.answer_lastday,
                answer_school: r.answer_school,
                answer_academy: r.answer_academy,
                question_1: r.question_1,
                question_2: r.question_2,
                question_3: r.question_3
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="response.xlsx"'
            }
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}