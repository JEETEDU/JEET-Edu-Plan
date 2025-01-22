import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {
    db_log,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {and, asc, desc, eq, like, sql} from 'drizzle-orm';
import {QueryBuilder} from "drizzle-orm/mysql-core";

/**
 * @swagger
 * /api/admin/user:
 *  patch:
 *      tags:
 *          - Admin/User
 *      description: <b>Admin</b><br>Update a user
 *      security:
 *          - cookieAuth: []
 *      summary: Update a user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user_id:
 *                              type: number
 *                              description: User's ID
 *                              example: 1
 *                          user_type:
 *                              type: number
 *                              description: User's type
 *                              example: 1
 *                          name:
 *                              type: string
 *                              description: User's name
 *                              example: "John"
 *                          first_year:
 *                              type: number
 *                              description: User's first year
 *                              example: 2020
 *                          school:
 *                              type: string
 *                              description: User's school
 *                              example: "Gyeonggibuk Science High School"
 *                          joined_term:
 *                              type: string
 *                              description: User's joined term
 *                              example: "2020 Spring"
 *                      required:
 *                          - user_id
 *      responses:
 *          "200":
 *              description: User updated
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
 *                                  example: "User updated"
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
export async function PATCH(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
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

            const data = await req.json();
            if (!data.user_id) {
                return return_400('user_id is required');
            }

            const user_id = data.user_id;

            const [user] =
                await tx.select()
                    .from(schema.users)
                    .where(
                        eq(schema.users.uid, user_id)
                    );

            if (!user) {
                return return_400('User not found');
            }
            if (user.user_type == 0) {
                return return_400('User is not accepted');
            }
            if (user.user_type == 3) {
                return return_400('Cannot update admin user');
            }

            const user_type: number = data.user_type ?? 0;
            const name: string = data.name ?? '';
            const first_year: number = data.first_year ?? 0;
            const school: string = data.school ?? '';
            const joined_term: string = data.joined_term ?? '';

            if (!user_type && !name && !first_year && !school && !joined_term) {
                return return_400('No data to update');
            }
            if (user_type < 0 || user_type > 3) {
                return return_400('Invalid user_type');
            }
            if (name && name.length > 5) {
                return return_400('Name is too long');
            }
            if (first_year && (first_year < 1901 || first_year > 2100)) {
                return return_400('Invalid first_year');
            }
            if (school && school.length > 255) {
                return return_400('School is too long');
            }
            if (joined_term && joined_term.length > 20) {
                return return_400('Joined_term is too long');
            }

            const update_data: any = {};
            if (user_type) update_data['user_type'] = user_type;
            if (name) update_data['name'] = name;
            if (first_year) update_data['first_year'] = first_year;
            if (school) update_data['school'] = school;
            if (joined_term) update_data['joined_term'] = joined_term;

            await tx.update(schema.users)
                .set(update_data)
                .where(eq(schema.users.uid, user_id));

            await db_log(tx, user_id, `User ${user_id} updated to ${JSON.stringify(update_data)}`);

            return NextResponse.json({
                success: true,
                message: "User updated"
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/admin/user:
 *  delete:
 *      tags:
 *          - Admin/User
 *      description: <b>Admin</b><br>Delete a user
 *      security:
 *          - cookieAuth: []
 *      summary: Delete a user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          user_id:
 *                              type: number
 *                              description: User's ID
 *                              example: 1
 *                      required:
 *                          - user_id
 *      responses:
 *          "200":
 *              description: User deleted
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
 *                                  example: "User deleted"
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
export async function DELETE(req: NextRequest) {
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
            if (!data.user_id) {
                return return_400('user_id is required');
            }
            const user_id = data.user_id;
            const [user] =
                await tx.select()
                    .from(schema.users)
                    .where(
                        eq(schema.users.uid, user_id)
                    );
            if (!user) {
                return return_400('User not found');
            }
            if (user.user_type == UserType.ADMIN) {
                return return_400('Cannot delete admin');
            }
            await tx.delete(schema.users)
                .where(eq(schema.users.uid, user_id));

            await db_log(tx, decoded.user_id, `User ${user.uid} deleted`);

            return NextResponse.json({
                success: true,
                message: 'User deleted',
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/admin/user:
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
 *              enum: ["user_id", "name", "first_year", "school", "joined_term"]
 *            description: Search by field (user_id, name(like), first_year(eq), school(like), joined_term(like))
 *            required: false
 *          - in: query
 *            name: search_string
 *            schema:
 *              type: string
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
 *          - in: query
 *            name: user_type
 *            schema:
 *              type: number
 *              example: 1
 *              enum: [0, 1, 2, 3]
 *            description: Filter by user type
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
 *                                          classes:
 *                                              type: array
 *                                              items:
 *                                                  type: object
 *                                                  properties:
 *                                                      id:
 *                                                          type: number
 *                                                          example: 1
 *                                                      name:
 *                                                          type: string
 *                                                          example: "G3 K"
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
        const page = parseInt(data.get('page') ?? '1');
        const limit = parseInt(data.get('limit') ?? '10');
        const search_by = data.get('search_by') ?? '';
        const search_string = data.get('search_string') ?? '';
        const user_type = parseInt(data.get('user_type') ?? '-1');
        const order_by = data.get('order_by') ?? 'name';
        const order = (data.get('order') ?? 'ASC').toUpperCase();

        if (isNaN(page)) {
            return return_400('Invalid page');
        }
        if (isNaN(limit)) {
            return return_400('Invalid limit');
        }

        const subqueryBuilder = new QueryBuilder();
        let subquery =
            subqueryBuilder.select()
                .from(schema.users)
                .$dynamic();
        let where_clause;
        if (search_by && search_string) {
            if (search_by == 'user_id') where_clause = eq(schema.users.uid, parseInt(search_string));
            else if (search_by == 'name') where_clause = like(schema.users.name, `%${search_string}%`);
            else if (search_by == 'first_year') where_clause = eq(schema.users.first_year, parseInt(search_string));
            else if (search_by == 'school') where_clause = like(schema.users.school, `%${search_string}%`);
            else if (search_by == 'joined_term') where_clause = like(schema.users.joined_term, `%${search_string}%`);
            else return return_400('Invalid search_by');
        }
        if (user_type !== -1) {
            if (isNaN(user_type)) return return_400('Invalid user_type');
            where_clause = and(
                eq(schema.users.user_type, user_type),
                where_clause
            );
        }
        if (limit) subquery = subquery.limit(limit).offset((page - 1) * limit);
        const sub_table = subquery.where(where_clause).as('subquery');

        const queryBuilder = new QueryBuilder();
        let query =
            queryBuilder.select({
                    uid: sub_table.uid,
                    login_id: sub_table.login_id,
                    user_type: sub_table.user_type,
                    name: sub_table.name,
                    first_year: sub_table.first_year,
                    school: sub_table.school,
                    joined_term: sub_table.joined_term,
                    class_id: sql`${schema.classes.id} as class_id`,
                    class_name: sql`${schema.classes.name} as class_name`
                })
                .from(sub_table)
                .leftJoin(
                    schema.studentClasses,
                    eq(schema.studentClasses.user_id, sub_table.uid)
                )
                .leftJoin(
                    schema.classes,
                    eq(schema.studentClasses.class_id, schema.classes.id)
                )
                .union(
                    queryBuilder.select({
                        uid: sub_table.uid,
                        login_id: sub_table.login_id,
                        user_type: sub_table.user_type,
                        name: sub_table.name,
                        first_year: sub_table.first_year,
                        school: sub_table.school,
                        joined_term: sub_table.joined_term,
                        class_id: sql`${schema.classes.id} as class_id`,
                        class_name: sql`${schema.classes.name} as class_name`
                    })
                    .from(sub_table)
                    .leftJoin(
                        schema.teacherClasses,
                        eq(schema.teacherClasses.user_id, sub_table.uid)
                    )
                    .leftJoin(
                        schema.classes,
                        eq(schema.teacherClasses.class_id, schema.classes.id)
                    )
                )
                .$dynamic();
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
                query = query.orderBy(order_func(sub_table.user_type));
            }
            else if (order_by == 'name') {
                query = query.orderBy(order_func(sub_table.name));
            }
            else if (order_by == 'first_year') {
                query = query.orderBy(order_func(sub_table.first_year));
            }
            else if (order_by == 'school') {
                query = query.orderBy(order_func(sub_table.school));
            }
            else if (order_by == 'joined_term') {
                query = query.orderBy(order_func(sub_table.joined_term));
            }
            else {
                return return_400('Invalid order_by');
            }
        }

        const [rows]: any = await db.execute(query);
        const users = Array.isArray(rows) ? rows.reduce((acc: any, row: any) => {
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
        }, []) : [];

        return NextResponse.json({
            success: true,
            users: users
        }, { status: 200 });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}