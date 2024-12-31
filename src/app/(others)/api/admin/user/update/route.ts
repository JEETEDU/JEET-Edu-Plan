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

/**
 * @swagger
 * /api/admin/user/update:
 *  post:
 *      tags:
 *          - Admin/User
 *      description: Update a user
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

            let update_data: any = {};
            if (user_type) update_data['user_type'] = user_type;
            if (name) update_data['name'] = name;
            if (first_year) update_data['first_year'] = first_year;
            if (school) update_data['school'] = school;
            if (joined_term) update_data['joined_term'] = joined_term;

            await tx.update(schema.usersTable)
                .set(update_data)
                .where(eq(schema.usersTable.uid, user_id));

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