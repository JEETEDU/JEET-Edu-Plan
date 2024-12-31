import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import {db_log, return_400, UserType} from "@/app/(others)/api/(tools)/tools";
import {verifyToken} from "@/app/(others)/api/(tools)/auth";

/**
 * @swagger
 * /api/admin/user/reject:
 *  post:
 *      tags:
 *          - Admin/User
 *      description: Reject a user
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
 *              description: User rejected
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
 *                                  example: "User rejected"
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
 */
export async function POST(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token: string = req.cookies.get("token")?.value ?? '';
            if (token) {
                let decoded = verifyToken(token);
                if (!decoded) { // invalid token
                    return NextResponse.redirect(new URL('/', req.url));
                }
                if (decoded.user_type < UserType.ADMIN) { // not admin
                    return return_400('Permission denied');
                }
            } else { // not logged in
                return NextResponse.redirect(new URL('/', req.url));
            }

            const data = await req.json();
            if (!data.user_id) {
                return return_400('user_id is required');
            }

            let [user] =
                await tx.select()
                    .from(schema.usersTable)
                    .where(
                        eq(schema.usersTable.uid, data.user_id)
                    );
            if (!user) {
                return return_400('User not found');
            }
            if (user.user_type != 0) {
                return return_400('User has already been approved');
            }

            await tx.delete(schema.usersTable)
                .where(
                    eq(schema.usersTable.uid, data.user_id)
                );

            await db_log(tx, data.user_id, `User ${user.uid} rejected`);

            return NextResponse.json({
                success: true,
                message: "User rejected"
            });
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, {status: 500});
    }
}