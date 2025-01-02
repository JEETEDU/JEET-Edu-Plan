import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, eq} from 'drizzle-orm';
import {
    db_log,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {studentClasses} from "@/database/schema";

/**
 * @swagger
 * /api/admin/class/delete:
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