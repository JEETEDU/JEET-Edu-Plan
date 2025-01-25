import type {NextRequest} from 'next/server';
import {db} from '@/database';
import * as schema from '@/database/schema';
import {NextResponse} from 'next/server';
import {and, eq} from 'drizzle-orm';
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
 * /api/admin/class/join/teacher:
 *  post:
 *      tags:
 *          - Admin/Class
 *      security:
 *          - cookieAuth: []
 *      summary: Join Teacher to the class
 *      description: <b>Admin</b><br>Join Teacher to the class
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
 *                          user_id:
 *                              type: number
 *                              description: User ID
 *                              example: 1
 *                          subject_id:
 *                              type: number
 *                              description: Subject ID
 *                              example: 1
 *                      required:
 *                          - class_id
 *                          - user_id
 *                          - subject_id
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
            } else { // not logged in
                return return_not_logged_in();
            }

            const data = await req.json();
            if (!data.class_id) {
                return return_400('class_id is required');
            }
            if (!data.user_id) {
                return return_400('user_id is required');
            }
            if (!data.subject_id) {
                return return_400('subject_id is required');
            }

            const [user] =
                await tx.select()
                    .from(schema.users)
                    .where(
                        eq(schema.users.uid, data.user_id)
                    );
            if (!user) {
                return return_400('User not found');
            }
            if (user.user_type < UserType.TEACHER) {
                return return_400('User is not a teacher');
            }

            const [class_] =
                await tx.select()
                    .from(schema.classes)
                    .leftJoin(
                        schema.teacherClasses,
                        and(
                            eq(schema.teacherClasses.user_id, data.user_id),
                            eq(schema.teacherClasses.class_id, data.class_id),
                            eq(schema.teacherClasses.subject_id, data.subject_id)
                        )
                    )
                    .where(
                        eq(schema.classes.id, data.class_id)
                    );
            if (!class_) {
                return return_400('Class not found');
            }
            if (class_.teacher_class) {
                // return return_400('User already joined class');
                return NextResponse.json({
                    success: true,
                    message: 'User already joined class'
                });
            }

            const [subject] =
                await tx.select()
                    .from(schema.subjects)
                    .where(
                        eq(schema.subjects.id, data.subject_id)
                    );

            if (!subject) {
                return return_400('Subject not found');
            }
            if (subject.class_id != data.class_id) {
                return return_400('Not a subject of this class');
            }

            await tx.insert(schema.teacherClasses)
                .values({
                    user_id: data.user_id,
                    class_id: data.class_id,
                    subject_id: data.subject_id
                });

            await db_log(tx, decoded.user_id, `Teacher ${user.uid} joined class ${class_.class_info.name} as ${subject.id} subject`);

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