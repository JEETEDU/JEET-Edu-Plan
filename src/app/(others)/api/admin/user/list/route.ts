import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {asc, desc, eq, like, sql} from 'drizzle-orm';
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
 * /api/admin/user/list:
 *  get:
 *      tags:
 *          - Admin/User
 *      description: <b>Admin</b><br>List users
 *      security:
 *          - cookieAuth: []
 *      summary: List users
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
 *            name: search_by
 *            schema:
 *              type: string
 *              example: "name"
 *              enum: ["user_id", "user_type", "name", "first_year", "school", "joined_term"]
 *            description: Search by field (user_id, user_type(0, 1, 2, 3), name(like), first_year(eq), school(like), joined_term(like))
 *            required: false
 *          - in: query
 *            name: search_string
 *            schema:
 *              type: string
 *              example: "john"
 *            description: Search string
 *            required: false
 *          - in: query
 *            name: order_by
 *            schema:
 *              type: string
 *              example: "name"
 *              enum: ["user_type", "name", "first_year", "school", "joined_term"]
 *              default: "name"
 *            description: Order by field
 *            required: false
 *          - in: query
 *            name: order
 *            schema:
 *              type: string
 *              example: "ASC"
 *            description: Order(ASC or DESC)
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
 *                                          uid:
 *                                              type: number
 *                                              example: 1
 *                                          login_id:
 *                                              type: string
 *                                              example: "john123"
 *                                          user_type:
 *                                              type: number
 *                                              example: 1
 *                                          name:
 *                                              type: string
 *                                              example: "John Doe"
 *                                          first_year:
 *                                              type: number
 *                                              example: 2021
 *                                          school:
 *                                              type: string
 *                                              example: "School of Computing"
 *                                          joined_term:
 *                                              type: string
 *                                              example: "2021 Spring"
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
            let decoded = verifyToken(token);
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
        const search_by = data.get('search_by') ?? '';
        const search_string = data.get('search_string') ?? '';
        const order_by = data.get('order_by') ?? 'name';
        const order = (data.get('order') ?? 'ASC').toUpperCase();

        if (isNaN(parseInt(page))) {
            return return_400('Invalid page');
        }
        if (isNaN(parseInt(limit))) {
            return return_400('Invalid limit');
        }

        let queryBuilder = new QueryBuilder();
        let query =
            queryBuilder.select({
                    uid: schema.users.uid,
                    login_id: schema.users.login_id,
                    user_type: schema.users.user_type,
                    name: schema.users.name,
                    first_year: schema.users.first_year,
                    school: schema.users.school,
                    joined_term: schema.users.joined_term,
                    class_id: sql`class_info.id as class_id`,
                    class_name: sql`class_info.name as class_name`
                })
                .from(schema.users)
                .leftJoin(
                    schema.studentClasses,
                    eq(schema.studentClasses.user_id, schema.users.uid)
                )
                .leftJoin(
                    schema.classes,
                    eq(schema.studentClasses.class_id, schema.classes.id)
                )
                .$dynamic();
        if (search_by && search_string) {
            if (search_by == 'user_id') {
                query = query.where(eq(schema.users.uid, parseInt(search_string)));
            }
            else if (search_by == 'user_type') {
                query = query.where(eq(schema.users.user_type, parseInt(search_string)));
            }
            else if (search_by == 'name') {
                query = query.where(like(schema.users.name, `%${search_string}%`));
            }
            else if (search_by == 'first_year') {
                query = query.where(eq(schema.users.first_year, parseInt(search_string)));
            }
            else if (search_by == 'school') {
                query = query.where(like(schema.users.school, `%${search_string}%`));
            }
            else if (search_by == 'joined_term') {
                query = query.where(like(schema.users.joined_term, `%${search_string}%`));
            }
            else {
                return return_400('Invalid search_by');
            }
        }
        if (order_by && order) {
            let order_func = asc;
            if (order == 'ASC') {
                order_func = asc;
            }
            else if (order == 'DESC') {
                order_func = desc;
            }
            else {
                return return_400('Invalid order');
            }

            if (order_by == 'user_type') {
                query = query.orderBy(order_func(schema.users.user_type));
            }
            else if (order_by == 'name') {
                query = query.orderBy(order_func(schema.users.name));
            }
            else if (order_by == 'first_year') {
                query = query.orderBy(order_func(schema.users.first_year));
            }
            else if (order_by == 'school') {
                query = query.orderBy(order_func(schema.users.school));
            }
            else if (order_by == 'joined_term') {
                query = query.orderBy(order_func(schema.users.joined_term));
            }
            else {
                return return_400('Invalid order_by');
            }
        }
        query = query.limit(parseInt(limit)).offset((parseInt(page) - 1) * parseInt(limit));
        console.log(query.toSQL());
        let [rows] = await db.execute(query);
        console.log(rows);
        let users = rows.reduce((acc: any, row: any) => {
            let user = acc.find((u: any) => u.uid === row.uid);
            if (!user) {
                user = {
                    uid: row.uid,
                    login_id: row.login_id,
                    user_type: row.user_type,
                    name: row.name,
                    first_year: row.first_year,
                    school: row.school,
                    joined_term: row.joined_term,
                    classes: []
                };
                acc.push(user);
            }
            if (row.class_id) {
                user.classes.push({
                    id: row.class_id,
                    name: row.class_name
                });
            }
            return acc;
        }, []);

        return NextResponse.json({
            success: true,
            users: users
        }, { status: 200 });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}