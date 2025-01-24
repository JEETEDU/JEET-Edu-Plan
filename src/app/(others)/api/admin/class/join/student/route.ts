import type {NextRequest} from 'next/server';
import {db} from '@/database';
import * as schema from '@/database/schema';
import {NextResponse} from 'next/server';
import {and, count, eq, sql} from 'drizzle-orm';
import {
    db_log,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {inArray} from "drizzle-orm/sql/expressions/conditions";

/**
 * @swagger
 * /api/admin/class/join/student:
 *  put:
 *      tags:
 *          - Admin/Class
 *      security:
 *          - cookieAuth: []
 *      summary: Join student to the class
 *      description: <b>Admin</b><br>Join student to the class
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          class_id:
 *                              type: number
 *                              example: 1
 *                          user_id:
 *                              type: array
 *                              items:
 *                                  type: number
 *                                  example: 1
 *                      required:
 *                          - class_id
 *                          - user_id
 *      responses:
 *          "200":
 *              description: User joined class
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
 *                                  example: "User joined class"
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
            let user_id = data.user_id;
            if (!class_id) return return_400('class_id is required');
            if (Number.isInteger(user_id)) user_id = [user_id];
            if (!user_id || data.user_id.length === 0) return return_400('user_id is required');

            const [user] =
                await tx.select({
                    user_count: count(schema.users.uid)
                })
                    .from(schema.users)
                    .where(
                        and(
                            inArray(schema.users.uid, user_id),
                            eq(schema.users.user_type, UserType.STUDENT)
                        )
                    )
            if (!user || user.user_count !== user_id.length) {
                return return_400('User not found or not student');
            }

            const [class_] =
                await tx.select({
                    class_id: schema.classes.id,
                    class_name: schema.classes.name,
                    user_count: count(schema.studentClasses.user_id)
                })
                    .from(schema.classes)
                    .leftJoin(
                        schema.studentClasses,
                        and(
                            eq(schema.studentClasses.class_id, schema.classes.id),
                            inArray(schema.studentClasses.user_id, user_id)
                        )
                    )
                    .where(
                        eq(schema.classes.id, class_id)
                    );
            if (!class_.class_id) {
                return return_400('Class not found');
            }

            await tx.insert(schema.studentClasses)
                .values(user_id.map((uid: number) => ({
                        user_id: uid,
                        class_id: class_id
                    }))
                )
                .onDuplicateKeyUpdate({
                    set: {
                        user_id: sql`user_id`
                    }
                })

            await db_log(tx, decoded.user_id, `User ${user_id} joined class ${class_.class_id}(${class_.class_name})`);

            return NextResponse.json({
                success: true,
                message: 'User joined class'
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}