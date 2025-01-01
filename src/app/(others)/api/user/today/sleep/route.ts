import type { NextRequest } from 'next/server'
import { db } from '@/database'
import * as schema from '@/database/schema'
import crypto from 'crypto'
import {NextResponse} from "next/server";
import {eq, and, sql, count} from "drizzle-orm";
import {DecodedToken, generateToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {QueryBuilder} from "drizzle-orm/mysql-core";

/**
 * @swagger
 * /api/user/today/sleep:
 *  post:
 *      tags:
 *          - User
 *      description: Register today's sleep time if not registered yet and update if already registered
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          sleep_time:
 *                              type: string
 *                              description: User's sleep time
 *                              example: "23:00"
 *                          wakeup_time:
 *                              type: string
 *                              description: User's wakeup time
 *                              example: "07:00"
 *                      required:
 *                          - sleep_time
 *                          - wakeup_time
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
export async function POST(req: NextRequest) {
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
            let sleep_time = data.sleep_time;
            let wakeup_time = data.wakeup_time;

            // Check if sleep_time and wake_time are valid as HH:MM
            const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timePattern.test(sleep_time) || !timePattern.test(wakeup_time)) {
                return return_400("Invalid time format");
            }

            let sleep_datetime = new Date();
            let wake_datetime = new Date();
            sleep_datetime.setHours(parseInt(sleep_time.split(":")[0]), parseInt(sleep_time.split(":")[1]), 0, 0);
            wake_datetime.setHours(parseInt(wakeup_time.split(":")[0]), parseInt(wakeup_time.split(":")[1]), 0, 0);

            if (sleep_datetime > wake_datetime) {
                sleep_datetime.setDate(sleep_datetime.getDate() - 1);
            }

            let [sleep_info] =
                await db.select({
                    count: count()
                })
                .from(schema.sleeps)
                .where(and(
                    eq(schema.sleeps.user_id, user_id),
                    eq(schema.sleeps.date, sql`CURDATE()`)
                ));
            if (sleep_info.count != 0) {
                await tx.update(schema.sleeps)
                    .set({
                        sleep: sleep_datetime,
                        wakeup: wake_datetime
                    })
                    .where(and(
                        eq(schema.sleeps.user_id, user_id),
                        eq(schema.sleeps.date, sql`CURDATE()`)
                    ));
                return NextResponse.json({
                    success: true,
                    message: "Sleep time updated"
                });
            }


            await tx.insert(schema.sleeps)
                .values({
                    user_id: user_id,
                    sleep: sleep_datetime,
                    wakeup: wake_datetime
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
 *          - User
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
 *                                          example: "23:00"
 *                                      wakeup:
 *                                          type: string
 *                                          example: "07:00"
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

        let queryBuilder = new QueryBuilder();
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
            eq(schema.sleeps.date, sql`CURDATE()`)
        ));

        let [sleep_info] = await db.execute(query);

        if (!sleep_info) {
            return return_400("No data found");
        }

        console.debug(query.toSQL().sql, query.toSQL().params);
        console.debug(sleep_info);

        return NextResponse.json({
            success: true,
            // @ts-ignore
            sleep_info: sleep_info.map((info: any) => {
                // Convert UTC to KST
                let sleep = new Date(info.sleep);
                sleep.setHours(sleep.getHours() + 9);
                let wakeup = new Date(info.wakeup);
                wakeup.setHours(wakeup.getHours() + 9);

                return {
                    sleep: `${sleep.getHours().toString().padStart(2, '0')}:${sleep.getMinutes().toString().padStart(2, '0')}`,
                    wakeup: `${wakeup.getHours().toString().padStart(2, '0')}:${wakeup.getMinutes().toString().padStart(2, '0')}`
                };
            })
        }, {status: 200});
    } catch (e: any) {
        console.error(e);
        return return_500();
    }
}