import type { NextRequest } from 'next/server'
import { db } from '@/database'
import * as schema from '@/database/schema'
import {NextResponse} from "next/server";
import {eq, and, count} from "drizzle-orm";
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
 * /api/user/today/sleep:
 *  put:
 *      tags:
 *          - User/Today
 *      summary: Register today's sleep time of the logged-in user
 *      description: Register today's sleep time if not registered yet and update if already registered
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          sleep:
 *                              type: string
 *                              description: User's sleep time
 *                              example: "2025-01-01T23:00:00.000Z"
 *                          wakeup:
 *                              type: string
 *                              description: User's wakeup time
 *                              example: "2025-01-02T07:00:00.000Z"
 *                      required:
 *                          - sleep
 *                          - wakeup
 *      responses:
 *          "200":
 *              description: Sleep time registered
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  example: "Sleep time registered"
 *          "400":
 *              description: Bad request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              message:
 *                                  type: string
 *                                  example: "Invalid time format"
 *          "401":
 *              description: Not logged in
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
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

            const data = await req.json();
            const sleep = data.sleep;
            const wakeup = data.wakeup;

            const isoTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
            if (!isoTimePattern.test(sleep) || !isoTimePattern.test(wakeup)) {
                return return_400("Invalid time format");
            }

            const [sleep_info] =
                await db.select({
                    count: count(schema.sleeps.date)
                })
                .from(schema.sleeps)
                .where(and(
                    eq(schema.sleeps.user_id, user_id),
                    // @ts-ignore
                    eq(schema.sleeps.date, todayString())
                ));
            if (sleep_info.count != 0) {
                await tx.update(schema.sleeps)
                    .set({
                        sleep: new Date(sleep),
                        wakeup: new Date(wakeup)
                    })
                    .where(and(
                        eq(schema.sleeps.user_id, user_id),
                        // @ts-ignore
                        eq(schema.sleeps.date, todayString())
                    ));
                return NextResponse.json({
                    success: true,
                    message: "Sleep time updated"
                });
            }


            await tx.insert(schema.sleeps)
                .values({
                    // @ts-ignore
                    date: todayString(),
                    user_id: user_id,
                    sleep: new Date(sleep),
                    wakeup: new Date(wakeup),
                });

            return NextResponse.json({
                success: true,
                message: "Sleep time registered"
            });
        });
    } catch (e: any) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/user/today/sleep:
 *  get:
 *      tags:
 *          - User/Today
 *      summary: Get today's sleep time of the logged in user
 *      description: Get today's sleep time. If date is not provided, it will return today's sleep time.
 *      parameters:
 *          - name: date
 *            in: query
 *            description: Date to get sleep time
 *            required: false
 *            schema:
 *              type: string
 *              example: "2021-01-01"
 *      responses:
 *          "200":
 *              description: Sleep time found
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              sleep_info:
 *                                  type: object
 *                                  properties:
 *                                      sleep:
 *                                          type: string
 *                                          example: "2025-01-01T23:00:00.000Z"
 *                                      wakeup:
 *                                          type: string
 *                                          example: "2025-01-02T07:00:00.000Z"
 *          "400":
 *              description: Bad request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              message:
 *                                  type: string
 *                                  example: "Invalid date format"
 *          "401":
 *              description: Not logged in
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
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
        const date = req.nextUrl.searchParams.get('date') ?? '';

        const queryBuilder = new QueryBuilder();
        let query =
            queryBuilder.select({
                    sleep: schema.sleeps.sleep,
                    wakeup: schema.sleeps.wakeup
                })
                .from(schema.sleeps).$dynamic();
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (date) {
            if (!datePattern.test(date)) {
                return return_400("Invalid date format");
            }
            query = query.where(and(
                // @ts-ignore
                eq(schema.sleeps.date, date),
                eq(schema.sleeps.user_id, user_id)
            ));
        }
        else query = query.where(and(
            eq(schema.sleeps.user_id, user_id),
            // @ts-ignore
            eq(schema.sleeps.date, todayString())
        ));

        const [sleep_info] = await db.execute(query);

        // @ts-ignore
        if (Object.keys(sleep_info).length === 0) {
            return return_400("No data found");
        }

        return NextResponse.json({
            success: true,
            // @ts-ignore
            sleep_info: sleep_info[0]
        }, {status: 200});
    } catch (e: any) {
        console.error(e);
        return return_500();
    }
}