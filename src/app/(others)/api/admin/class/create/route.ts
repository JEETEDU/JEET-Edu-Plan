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
import {classes} from "@/database/schema";

/**
 * @swagger
 * /api/admin/class/create:
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

            const [class_id] =
                await tx.insert(schema.classes)
                .values({
                    name: name.toString(),
                    display: display ? 1 : 0
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