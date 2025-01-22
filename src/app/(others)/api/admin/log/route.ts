import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {desc, eq, like} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {verifyToken} from "@/app/(others)/api/(tools)/auth";
import {QueryBuilder} from "drizzle-orm/mysql-core";

/**
 * @swagger
 * /api/admin/log:
 *  get:
 *      tags:
 *          - Admin
 *      security:
 *          - cookieAuth: []
 *      summary: List logs
 *      description: <b>Admin</b><br>List logs
 *      parameters:
 *          - in: query
 *            name: page
 *            schema:
 *              type: number
 *              default: 1
 *              example: 1
 *            description: Page number
 *            required: false
 *          - in: query
 *            name: limit
 *            schema:
 *              type: number
 *              default: 10
 *              example: 10
 *            description: Number of items per page
 *            required: false
 *          - in: query
 *            name: user_id
 *            schema:
 *              type: number
 *              example: 1
 *            description: User's ID to search logs
 *            required: false
 *          - in: query
 *            name: search_string
 *            schema:
 *              type: string
 *              example: "login"
 *            description: Search string
 *            required: false
  *      responses:
 *          "200":
 *              description: List of users
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              users:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: number
 *                                              example: 1
 *                                          user_id:
 *                                              type: number
 *                                              example: 1
 *                                          detail:
 *                                              type: string
 *                                              example: "User login"
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
 *                                  example: "error message"
 *          "401":
 *              description: Not logged in
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
 *                                  example: "error message"
 *          "403":
 *              description: Permission denied
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
 *                                  example: "error message"
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
        }
        else { // not logged in
            return return_not_logged_in();
        }

        const data = req.nextUrl.searchParams;
        const page = data.get('page') ?? '1';
        const limit = data.get('limit') ?? '10';
        const user_id = data.get('user_id') ?? '0';
        const search_string = data.get('search_string') ?? '';

        if (isNaN(parseInt(page))) {
            return return_400('Invalid page');
        }
        if (isNaN(parseInt(limit))) {
            return return_400('Invalid limit');
        }
        if (isNaN(parseInt(user_id))) {
            return return_400('Invalid user_id');
        }

        const queryBuilder = new QueryBuilder();
        let query =
            queryBuilder.select({
                'log_id': schema.logs.id,
                'user_id': schema.logs.user_id,
                'detail': schema.logs.detail,
                'time': schema.logs.time
            })
                .from(schema.logs)
                .$dynamic();
        if (parseInt(user_id)) {
            query = query.where(eq(schema.logs.user_id, parseInt(user_id)));
        }
        if (search_string) {
            query = query.where(like(schema.logs.detail, `%${search_string}%`));
        }
        query = query.orderBy(desc(schema.logs.time));
        query = query.limit(parseInt(limit));
        query = query.offset((parseInt(page) - 1) * parseInt(limit));

        const [logs] = await db.execute(query);
        return NextResponse.json({
            success: true,
            logs: logs
        }, { status: 200 });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}