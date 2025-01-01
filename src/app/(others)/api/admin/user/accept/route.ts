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
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";

/**
 * @swagger
 * /api/admin/user/accept:
 *  post:
 *      tags:
 *          - Admin/User
 *      description: Accept a user
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
 *              description: User accepted
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
 *                                  example: "User accepted"
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
            if (!data.user_id) {
                return return_400('user_id is required');
            }

            let [user] =
                await tx.select()
                    .from(schema.users)
                    .where(
                        eq(schema.users.uid, data.user_id)
                    );
            if(!user) {
                return return_400('User not found');
            }
            if (user.user_type != 0) {
                return return_400('User has already been approved');
            }

            await tx.update(schema.users)
                .set({user_type: 1})
                .where(eq(schema.users.uid, data.user_id));

            await db_log(tx, decoded.user_id, `User ${user.uid} approved`);

            return NextResponse.json({
                success: true,
                message: 'User approved'
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}