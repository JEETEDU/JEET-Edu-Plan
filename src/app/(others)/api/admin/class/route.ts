import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, eq, like} from 'drizzle-orm';
import {
    db_log,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {check_admin_permission} from "@/app/(others)/api/admin/(tools)/tools";
import {QueryBuilder} from "drizzle-orm/mysql-core";


/**
 * @swagger
 * /api/admin/class:
 *  get:
 *      tags:
 *          - Admin/Class
 *      summary: Get classes
 *      description: <b>Admin</b><br>Retrieve a list of classes filtered by name
 *      security:
 *          - cookieAuth: []
 *      parameters:
 *          - in: query
 *            name: name
 *            schema:
 *              type: string
 *            description: Filter classes by name (partial match)
 *            required: false
 *      responses:
 *          "200":
 *              description: Classes retrieved successfully
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              classes:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: number
 *                                              example: 1
 *                                          name:
 *                                              type: string
 *                                              example: "G3 K"
 *                                          display:
 *                                              type: boolean
 *                                              example: true
 *                                          description:
 *                                              type: string
 *                                              example: "Class description"
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
 *                                  example: "Error message"
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
 *                                  example: "Not logged in"
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
 *                                  example: "Permission denied"
 */
export async function GET(req: NextRequest) {
    try {
        let token: DecodedToken | NextResponse = check_admin_permission(req.cookies.get("token")?.value ?? '');
        if (token instanceof NextResponse) return token;

        const data = req.nextUrl.searchParams;
        const name = data.get('name') ?? '';

        let classes = await db.select({
            id: schema.classes.id,
            name: schema.classes.name,
            display: schema.classes.display,
            description: schema.classes.description
        })
            .from(schema.classes)
            .where(
                like(schema.classes.name, `%${name}%`)
            );

        return NextResponse.json({
            success: true,
            classes: classes
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/admin/class:
 *  post:
 *      tags:
 *          - Admin/Class
 *      security:
 *          - cookieAuth: []
 *      summary: Create a class
 *      description: <b>Admin</b><br>Create a class
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          class_name:
 *                              type: string
 *                              description: Class name
 *                              example: "G3 K"
 *                          display:
 *                              type: boolean
 *                              description: Display the class
 *                              example: true
 *                          description:
 *                              type: string
 *                              description: Class description
 *                      required:
 *                          - class_name
 *      responses:
 *          "200":
 *              description: Class created
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
 *                                  example: "Class created"
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
export async function POST(req: NextRequest) {
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
            let name = data.class_name;
            const display = data.display ?? false;
            if (!name) {
                return return_400('class_name is required');
            }
            name = name.toString();
            if (name.length > 255) {
                return return_400('class_name is too long');
            }
            if (typeof display !== 'boolean') {
                return return_400('display must be a boolean');
            }
            if (data.description?.length > 255) {
                return return_400('description is too long');
            }

            const [class_id] =
                await tx.insert(schema.classes)
                .values({
                    name: name.toString(),
                    display: display ? 1 : 0,
                    description: data.description ?? ''
                }).$returningId();

            await db_log(tx, decoded.user_id, `Class ${class_id.id}(name: ${name}) created`);

            return NextResponse.json({
                success: true,
                message: "Class created"
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/admin/class:
 *  delete:
 *      tags:
 *          - Admin/Class
 *      summary: Delete a class
 *      description: <b>Admin</b><br>Delete a class
 *      security:
 *          - cookieAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          class_id:
 *                              type: number
 *                              description: Class ID
 *                              example: 1
 *                      required:
 *                          - class_id
 *      responses:
 *          "200":
 *              description: Class deleted
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
 *                                  example: "Class deleted"
 *          "400":
 *              description: Bad request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
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
            } else { // not logged in
                return return_not_logged_in();
            }

            const data = await req.json();
            if (!data.class_id) {
                return return_400('class_id is required');
            }

            let [class_] = await tx.select()
                .from(schema.classes)
                .where(
                    eq(schema.classes.id, data.class_id)
                );

            if (!class_) {
                return return_400('Class not found');
            }

            await tx.delete(schema.classes)
                .where(
                    eq(schema.classes.id, data.class_id)
                );

            await db_log(tx, decoded.user_id, `Class ${data.class_id} deleted`);

            return NextResponse.json({
                success: true,
                message: "Class deleted"
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/admin/class:
 *  put:
 *      tags:
 *          - Admin/Class
 *      security:
 *          - cookieAuth: []
 *      summary: Update a class info
 *      description: <b>Admin</b><br>Update a class info
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          class_id:
 *                              type: number
 *                              description: Class's ID
 *                              example: 1
 *                          class_name:
 *                              type: string
 *                              description: Class name
 *                              example: "G3 K"
 *                          display:
 *                              type: boolean
 *                              description: Display the class
 *                              example: true
 *                          description:
 *                              type: string
 *                              description: Class description
 *                              example: "Class description"
 *                      required:
 *                          - class_id
 *                          - class_name
 *      responses:
 *          "200":
 *              description: Class updated
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
 *                                  example: "Class updated"
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
            } else { // not logged in
                return return_not_logged_in();
            }

            const data = await req.json();
            const class_id = data.class_id;
            let name = data.class_name;
            const display = data.display ?? false;
            if (!class_id) {
                return return_400('class_id is required');
            }
            if (!name) {
                return return_400('class_name is required');
            }
            name = name.toString();
            if (name.length > 255) {
                return return_400('class_name is too long');
            }
            if (typeof display !== 'boolean') {
                return return_400('display must be a boolean');
            }
            if (data.description?.length > 255) {
                return return_400('description is too long');
            }

            let [classInfo] =
                await tx.select()
                    .from(schema.classes)
                    .where(
                        eq(schema.classes.id, class_id)
                    );
            if (!classInfo) {
                return return_400('Class not found');
            }

            await tx.update(schema.classes)
                .set({
                    name: name.toString(),
                    display: display ? 1 : 0,
                    description: data.description ?? ''
                })
                .where(eq(schema.classes.id, class_id));

            await db_log(tx, decoded.user_id, `Updated class ${class_id} to ${name}/${display ? 'display' : 'hidden'}`);

            return NextResponse.json({
                success: true,
                message: 'Class updated'
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}