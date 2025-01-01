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
 * /api/admin/class/update:
 *  put:
 *      tags:
 *          - Admin/Class
 *      description: Update a class info
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
            }
            else { // not logged in
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
                    display: display ? 1 : 0
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