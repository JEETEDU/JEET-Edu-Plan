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
 * /api/user/info/{user_id}:
 *  get:
 *      tags:
 *          - User
 *      description: Get user info of a specific user<br>Data returned depends on the user's type
 *      parameters:
 *          - name: user_id
 *            in: path
 *            description: User's ID
 *            required: true
 *            schema:
 *                type: number
 *                example: 1
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
 *                                           example: "john123(only for admin)"
 *                                       user_type:
 *                                           type: number
 *                                           example: 1
 *                                       name:
 *                                           type: string
 *                                           example: "John Doe"
 *                                       first_year:
 *                                           type: number
 *                                           example: 2021(only for teacher)
 *                                       school:
 *                                           type: string
 *                                           example: "School of Computing(only for teacher)"
 *                                       joined_term:
 *                                           type: string
 *                                           example: "2021 Spring(only for teacher)"
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
 */
export async function GET(req: NextRequest, { params }: { params: { user_id: number } }) {
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

        // params should be awaited
        const user_id = (await params).user_id;
        if (!user_id) {
            return return_400('user_id is required');
        }

        // set select_columns based on user_type
        let select_columns: any = {
            uid: schema.users.uid,
            user_type: schema.users.user_type,
            name: schema.users.name
        }
        if (decoded.user_type >= UserType.TEACHER) {
            select_columns = {
                ...select_columns,
                first_year: schema.users.first_year,
                school: schema.users.school,
                joined_term: schema.users.joined_term
            }
            if (decoded.user_type == UserType.ADMIN) {
                select_columns = {
                    ...select_columns,
                    login_id: schema.users.login_id
                }
            }
        }

        const [user] =
            await db.select(select_columns)
                .from(schema.users)
                .where(eq(schema.users.uid, user_id));

        if (!user) {
            return return_400('user not found');
        }

        return NextResponse.json({
            success: true,
            user: user
        }, {status: 200});
    } catch (e) {
        console.error(e);
        return return_500();
    }
}