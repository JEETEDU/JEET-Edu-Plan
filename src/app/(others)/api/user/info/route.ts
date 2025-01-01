import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import {
    return_400, return_500,
    return_not_logged_in,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";

/**
 * @swagger
 * /api/user/info:
 *  get:
 *      tags:
 *          - User
 *      description: Get user info of the logged in user
 *      responses:
 *          "200":
 *              description: User info retrieved
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              user:
 *                                  type: object
 *                                  properties:
 *                                       uid:
 *                                           type: number
 *                                           example: 1
 *                                       login_id:
 *                                           type: string
 *                                           example: "john123"
 *                                       user_type:
 *                                           type: number
 *                                           example: 1
 *                                       name:
 *                                           type: string
 *                                           example: "John Doe"
 *                                       first_year:
 *                                           type: number
 *                                           example: 2021
 *                                       school:
 *                                           type: string
 *                                           example: "School of Computing"
 *                                       joined_term:
 *                                           type: string
 *                                           example: "2021 Spring"
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
        }
        else {
            return return_not_logged_in();
        }

        let [user] =
            await db.select({
                    uid: schema.users.uid,
                    login_id: schema.users.login_id,
                    user_type: schema.users.user_type,
                    name: schema.users.name,
                    first_year: schema.users.first_year,
                    school: schema.users.school,
                    joined_term: schema.users.joined_term
                })
                .from(schema.users)
                .where(eq(schema.users.uid, decoded.user_id))

        return NextResponse.json({
            success: true,
            user: user
        }, {status: 200});
    } catch (e) {
        console.error(e);
        return return_500();
    }
}