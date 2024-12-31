import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import {
    db_log,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {verifyToken} from "@/app/(others)/api/(tools)/auth";
import crypto from 'crypto'

/**
* @swagger
* /api/admin/user/reset_password:
*  post:
*      tags:
*          - Admin/User
*      description: Reset password of a user
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
*              description: Password reset successful
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
*                                  example: "Password reset successful"
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

            const data = await req.json();
            if (!data.user_id) {
                return return_400('user_id is required');
            }

            const user_id = data.user_id;

            let [user] =
                await tx.select()
                    .from(schema.usersTable)
                    .where(
                        eq(schema.usersTable.uid, user_id)
                    );

            if (!user) {
                return return_400('User not found');
            }
            if (user.user_type == 3) {
                return return_400('Cannot reset password of an admin user');
            }

            const new_random_password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await tx.update(schema.usersTable)
                .set({
                    //@ts-ignore
                    pw: crypto.createHash('sha256').update(new_random_password).digest()
                })
                .where(eq(schema.usersTable.uid, user_id));

            await db_log(tx, user_id, `Password reset for user ${user_id} to ${new_random_password}`);

            return NextResponse.json({
                success: true,
                message: `Password reset for user ${user_id}. New password: ${new_random_password}`
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}