import type { NextRequest } from 'next/server'
import { db } from '@/database'
import * as schema from '@/database/schema'
import {NextResponse} from "next/server";
import {eq, and, sql, count, SQL} from "drizzle-orm";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {
    return_400,
    return_500,
    return_not_logged_in,
    todayString,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {QueryBuilder} from "drizzle-orm/mysql-core";


/**
 * @swagger
 * /api/user/today/question:
 *   get:
 *     summary: Get the user's answers for today's questions of the logged in user
 *     description: <b>Student</b><br>Get the user's answers for today's questions of the logged in user and the questions for today. If the date is not specified, it will return the answers for today. If the date is specified, it will return the answers for that date.
 *     tags:
 *       - User/Today
 *     parameters:
 *       - name: date
 *         in: query
 *         description: Filter answers by a specific date (format YYYY-MM-DD).
 *         required: false
 *         schema:
 *           type: string
 *           pattern: ^\d{4}-\d{2}-\d{2}$
 *     responses:
 *       200:
 *         description: Successfully fetched answers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 answers:
 *                   type: object
 *                   properties:
 *                     answer_1:
 *                       type: string
 *                     answer_2:
 *                       type: string
 *                     answer_3:
 *                       type: string
 *                     answer_lastday:
 *                       type: string
 *                     answer_school:
 *                       type: string
 *                     answer_academy:
 *                       type: string
 *       400:
 *         description: Invalid request, such as invalid date format or no data found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid date format
 *       401:
 *         description: User is not logged in or the token is missing/invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not logged in
 *       403:
 *         description: User does not have the necessary permissions (not a STUDENT).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You are not a student
 */
export async function GET(req: NextRequest) {
    try {
        const token: string = req.cookies.get("token")?.value ?? '';
        let decoded: DecodedToken | false;
        if (token) {
            decoded = verifyToken(token);
            if (!decoded) {
                return return_not_logged_in();
            }
            if (decoded.user_type !== UserType.STUDENT) {
                return return_400("You are not a student");
            }
        } else {
            return return_not_logged_in();
        }

        const user_id = decoded.user_id;
        let date: string | SQL = req.nextUrl.searchParams.get('date') ?? '';
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (date) {
            if (!datePattern.test(date)) {
                return return_400("Invalid date format");
            }
        }
        else date = todayString();

        const queryBuilder = new QueryBuilder();
        const query =
            queryBuilder.select({
                    answers: schema.todayAnswers,
                    questions: schema.todayQuestions
                })
                .from(schema.todayQuestions)
                .leftJoin(
                    schema.todayAnswers,
                    and(
                        eq(schema.todayAnswers.date, schema.todayQuestions.date),
                        eq(schema.todayAnswers.user_id, user_id)
                    )
                )
                .where(
                    // @ts-ignore
                    eq(schema.todayQuestions.date, date)
                )
                .union(
                    // @ts-ignore
                    queryBuilder.select({
                        answers: schema.todayAnswers,
                        questions: schema.todayQuestions
                    })
                    .from(schema.todayQuestions)
                    .rightJoin(
                        schema.todayAnswers,
                        and(
                            eq(schema.todayAnswers.date, schema.todayQuestions.date),
                            eq(schema.todayAnswers.user_id, user_id)
                        )
                    )
                    .where(
                        // @ts-ignore
                        eq(schema.todayAnswers.date, date)
                    )
                ).$dynamic();

        const [answers] = await db.execute(query);

        // @ts-ignore
        if (answers.length == 0) {
            return return_400("No data found");
        }

        return NextResponse.json({
            success: true,
            // @ts-ignore
            answers: answers.map((answer: any) => {
                return {
                    answers: {
                        answer_1: answer.answer_1,
                        answer_2: answer.answer_2,
                        answer_3: answer.answer_3,
                        answer_lastday: answer.answer_lastday,
                        answer_school: answer.answer_school,
                        answer_academy: answer.answer_academy
                    },
                    questions: {
                        question_1: answer.question_1,
                        question_2: answer.question_2,
                        question_3: answer.question_3
                    }
                };
            })
        }, {status: 200});
    } catch (e: any) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/user/today/question:
 *   put:
 *     summary: Register or update the user's answers for today's questions of the logged in user
 *     description: <b>Student</b><br><li>answer_n - n번째 오늘의 질문 답변.<br><li>answer_lastday - 어젯밤 공부한 내용.<br><li>answer_school - 오늘 학교 과제.<br><li>answer_academy - 오늘 학원 과제.
 *     tags:
 *       - User/Today
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer_1:
 *                 type: string
 *                 description: Answer to today's first question.
 *               answer_2:
 *                 type: string
 *                 description: Answer to today's second question.
 *               answer_3:
 *                 type: string
 *                 description: Answer to today's third question.
 *               answer_lastday:
 *                 type: string
 *                 description: Refers to the last day's answer (if relevant).
 *               answer_school:
 *                 type: string
 *                 description: Answer about the school-related question.
 *               answer_academy:
 *                 type: string
 *                 description: Answer about the academy or institution-related question.
 *     responses:
 *       200:
 *         description: The answers were successfully submitted or updated.
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
 *                   example: Answers updated
 *       400:
 *         description: Bad request, such as missing required answers or no questions available for today.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: answer_1 is required
 *       401:
 *         description: User is not logged in or the token is missing/invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not logged in
 *       403:
 *         description: User does not have the necessary permissions (not a STUDENT).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You are not a student
 */
export async function PUT(req: NextRequest) {
    try {
        return await db.transaction(async (tx) => {
            const token: string = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false;
            if (token) {
                decoded = verifyToken(token);
                if (!decoded) {
                    return return_not_logged_in();
                }
                if (decoded.user_type !== UserType.STUDENT) {
                    return return_400("You are not a student");
                }
            } else {
                return return_not_logged_in();
            }

            const user_id = decoded.user_id;

            const [questions] =
                await tx.select({
                    date: schema.todayQuestions.date,
                    question_1: schema.todayQuestions.question_1,
                    question_2: schema.todayQuestions.question_2,
                    question_3: schema.todayQuestions.question_3,
                })
                .from(schema.todayQuestions)
                .where(
                    eq(schema.todayQuestions.date, sql`CURDATE()`)
                );

            const question_1 = questions?.question_1 ?? '';
            const question_2 = questions?.question_2 ?? '';
            const question_3 = questions?.question_3 ?? '';

            const data = await req.json();
            const answer_1 = data.answer_1 ?? '';
            const answer_2 = data.answer_2 ?? '';
            const answer_3 = data.answer_3 ?? '';
            const answer_lastday = data.answer_lastday ?? '';
            const answer_school = data.answer_school ?? '';
            const answer_academy = data.answer_academy ?? '';

            if (question_1 && !answer_1) {
                return return_400('answer_1 is required');
            }
            if (question_2 && !answer_2) {
                return return_400('answer_2 is required');
            }
            if (question_3 && !answer_3) {
                return return_400('answer_3 is required');
            }

            const [todayAnswers] =
                await tx.select({
                    count: count()
                })
                .from(schema.todayAnswers)
                .where(and(
                    eq(schema.todayAnswers.user_id, user_id),
                    eq(schema.todayAnswers.date, sql`CURDATE()`)
                ));
            if(todayAnswers.count != 0) {
                await tx.update(schema.todayAnswers)
                    .set({
                        answer_1: answer_1,
                        answer_2: answer_2,
                        answer_3: answer_3,
                        answer_lastday: answer_lastday,
                        answer_school: answer_school,
                        answer_academy: answer_academy
                    })
                    .where(and(
                        eq(schema.todayAnswers.user_id, user_id),
                        eq(schema.todayAnswers.date, sql`CURDATE()`)
                    ));
                return NextResponse.json({
                    success: true,
                    message: "Answers updated"
                });
            }

            await tx.insert(schema.todayAnswers)
                .values({
                    date: questions?.date ?? sql`CURDATE()`,
                    user_id: user_id,
                    answer_1: answer_1,
                    answer_2: answer_2,
                    answer_3: answer_3,
                    answer_lastday: answer_lastday,
                    answer_school: answer_school,
                    answer_academy: answer_academy
                });

            return NextResponse.json({
                success: true,
                message: "Answers submitted"
            });
        });
    } catch (e: any) {
        console.error(e);
        return return_500();
    }
}