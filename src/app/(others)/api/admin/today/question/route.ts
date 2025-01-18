import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {count, eq, SQL, sql} from 'drizzle-orm';
import {
    db_log,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied, to_date_string, todayString,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";


/**
 * @swagger
 * /api/admin/today/question:
 *   put:
 *     summary: Create or update today's question.
 *     description: <b>Admin</b><br>Create or update today's question. If today's question is already created, it will be updated. Otherwise, it will be created. If date is not provided, it will change today's.
 *     tags:
 *       - Admin/Today
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_1:
 *                 type: string
 *                 description: The first question (mandatory)
 *                 example: "What is your name?"
 *               question_2:
 *                 type: string
 *                 description: The second question (optional but required if the third question is provided)
 *                 example: "What is your favorite color?"
 *               question_3:
 *                 type: string
 *                 description: The third question (optional)
 *                 example: "What is your hobby?"
 *               date:
 *                 type: string
 *                 description: Date in YYYY-MM-DD format
 *                 example: "2025-01-01"
 *             required:
 *               - question_1
 *     responses:
 *       200:
 *         description: Successfully created or updated today's questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully updated today question"
 *       400:
 *         description: Bad Request - Missing required fields or invalid inputs
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
 *                   example: "question_1 is required"
 *       401:
 *         description: Unauthorized - User is not logged in or token is invalid
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
 *                   example: "Not logged in"
 *       403:
 *         description: Forbidden - Insufficient permissions
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
 *                   example: "Permission denied"
 */
export async function PUT(req: NextRequest) {
    try {
    return db.transaction(async (tx) => {
        const token: string = req.cookies.get("token")?.value ?? '';
        let decoded: DecodedToken | false;
        if (token) {
            decoded = verifyToken(token);
            if (!decoded) { // invalid token
                return return_not_logged_in();
            }
            if (decoded.user_type < UserType.ADMIN) { // not admin
                return return_permission_denied();
            }
        }
        else { // not logged in
            return return_not_logged_in();
        }

        const data = await req.json();
        if(!data.question_1 && (data.question_2 || data.question_3)) return return_400('question_1 is required');
        if(!data.question_2 && data.question_3) return return_400('question_2 is required');
        let date: string | SQL = data.date ?? '';

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (date) {
            // @ts-ignore
            if (!datePattern.test(date)) {
                return return_400('Invalid date format');
            }
        }
        else date = todayString();

        let [today_question] = await db.select({
            count: count()
        })
            .from(schema.todayQuestions)
            .where(
                // @ts-ignore
                eq(schema.todayQuestions.date, date)
            );
        if (today_question.count > 0) {
            await tx.update(schema.todayQuestions)
                .set({
                    question_1: data.question_1,
                    question_2: data.question_2,
                    question_3: data.question_3
                })
                .where(
                    // @ts-ignore
                    eq(schema.todayQuestions.date, date)
                );

            await db_log(tx, decoded.user_id, `Updated today question for ${date} with question_1: ${data.question_1}, question_2: ${data.question_2}, question_3: ${data.question_3}`);

            return NextResponse.json({
                success: true,
                message: 'Successfully updated today question'
            });
        }
        await tx.insert(schema.todayQuestions)
            .values({
                // @ts-ignore
                date: date,
                question_1: data.question_1,
                question_2: data.question_2,
                question_3: data.question_3,
            });
        await db_log(tx, decoded.user_id, `Created today question for ${date} with question_1: ${data.question_1}, question_2: ${data.question_2}, question_3: ${data.question_3}`);
        return NextResponse.json({
            success: true,
            message: 'Successfully created today question'
        });
    });
} catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/admin/today/question:
 *   get:
 *     summary: Get today's questions
 *     description: <b>Admin</b><br>Get today's questions. If date is not provided, it will get today's questions.
 *     security:
 *       - cookieAuth: []
 *     tags:
 *       - Admin/Today
 *     parameters:
 *       - name: date
 *         in: query
 *         description: The date to get the questions for. If not provided, it will get the questions for today.
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2022-01-01"
 *     responses:
 *       200:
 *         description: Successfully retrieved today's questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 today_questions:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2022-01-01"
 *                     question_1:
 *                       type: string
 *                       example: "What is your name?"
 *                     question_2:
 *                       type: string
 *                       example: "What is your favorite color?"
 *                     question_3:
 *                       type: string
 *                       example: "What is your hobby?"
 *       400:
 *         description: Bad Request - Invalid date format
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
 *                   example: "Invalid date format"
 *       401:
 *         description: Unauthorized - User is not logged in or token is invalid
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
 *                   example: "Not logged in"
 *       403:
 *         description: Forbidden - Insufficient permissions
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
 *                   example: "Permission denied"
 */
export async function GET(req: NextRequest) {
    try {
        const token: string = req.cookies.get("token")?.value ?? '';
        let decoded: DecodedToken | false;
        if (token) {
            decoded = verifyToken(token);
            if (!decoded) { // invalid token
                return return_not_logged_in();
            }
            if (decoded.user_type < UserType.ADMIN) { // not admin
                return return_permission_denied();
            }
        }
        else { // not logged in
            return return_not_logged_in();
        }

        const data = await req.nextUrl.searchParams;
        const date = data.get('date') ?? '';
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (date) {
            if (!datePattern.test(date)) {
                return return_400('Invalid date format');
            }
        }

        let [today_questions] = await db.select()
            .from(schema.todayQuestions)
            .where(
                // @ts-ignore
                eq(schema.todayQuestions.date, date ? date : todayString())
            );
        if (!today_questions) {
            return NextResponse.json({
                success: false,
                message: 'No question for today'
            });
        }
        console.log(today_questions);
        return NextResponse.json({
            success: true,
            today_questions: {
                date: date ? date : todayString(),
                question_1: today_questions.question_1,
                question_2: today_questions.question_2,
                question_3: today_questions.question_3
            }
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}
