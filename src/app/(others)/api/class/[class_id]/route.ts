import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {asc, desc, eq, like, sql} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {QueryBuilder} from "drizzle-orm/mysql-core";


/**
 * @swagger
 * /api/class/{class_id}:
 *   get:
 *     summary: Get details about a specific class
 *     description: Retrieves information about a specific class, including its students and teachers, based on the user type.
 *     tags:
 *       - Classes
 *     parameters:
 *       - name: class_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the class to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the class information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 class:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Mathematics 101"
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           uid:
 *                             type: string
 *                             example: "123abc"
 *                           user_type:
 *                             type: integer
 *                             example: 2
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           first_year:
 *                             type: integer
 *                             example: 2020(only for teacher)
 *                           school:
 *                             type: string
 *                             example: "Greenwood High(only for teacher)"
 *                           joined_term:
 *                             type: string
 *                             example: "Spring(only for teacher)"
 *                           login_id:
 *                             type: string
 *                             example: "johndoe123(only for admin)"
 *                     teachers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           uid:
 *                             type: string
 *                             example: "789xyz"
 *                           user_type:
 *                             type: integer
 *                             example: 3
 *                           name:
 *                             type: string
 *                             example: "Jane Smith"
 *                           first_year:
 *                             type: integer
 *                             example: 2018
 *                           school:
 *                             type: string
 *                             example: "Greenwood High"
 *                           joined_term:
 *                             type: string
 *                             example: "Fall"
 *                           login_id:
 *                             type: string
 *                             example: "janesmith789"
 *                           subject:
 *                             type: object
 *                             properties:
 *                                 id:
 *                                     type: integer
 *                                     example: 1
 *                                 name:
 *                                     type: string
 *                                     example: "Mathematics"
 *       400:
 *         description: Class not found or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Class not found"
 *       401:
 *         description: User not logged in or unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not logged in"
 *       403:
 *         description: Permission denied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Permission denied"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export async function GET(req: NextRequest, {params}: {params: {class_id: number}}): Promise<NextResponse> {
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

        const class_id = (await params).class_id;

        let [class_] = await db.select()
            .from(schema.classes)
            .where(
                eq(schema.classes.id, class_id)
            );
        if (!class_) {
            return return_400('Class not found');
        }

        let user_select_columns: any = {
            uid: schema.users.uid,
            user_type: schema.users.user_type,
            name: schema.users.name
        }
        if (decoded.user_type >= UserType.TEACHER) {
            user_select_columns = {
                ...user_select_columns,
                first_year: schema.users.first_year,
                school: schema.users.school,
                joined_term: schema.users.joined_term
            }
            if (decoded.user_type == UserType.ADMIN) {
                user_select_columns = {
                    ...user_select_columns,
                    login_id: schema.users.login_id
                }
            }
        }
        let students = await db.select(
            user_select_columns
        )
            .from(schema.users)
            .leftJoin(
                schema.studentClasses,
                eq(schema.studentClasses.user_id, schema.users.uid)
            )
            .where(
                eq(schema.studentClasses.class_id, class_id)
            );

        // if the user is a student, they should only see their own information
        if (decoded.user_type == UserType.STUDENT) {
            if (students.filter((student: any) => student.uid == decoded.user_id).length == 0) {
                return return_permission_denied();
            }
        }

        let teachers = await db.select({
            ...user_select_columns,
            subject: {
                id: schema.subjects.id,
                name: schema.subjects.name
            }
        })
            .from(schema.users)
            .leftJoin(
                schema.teacherClasses,
                eq(schema.teacherClasses.user_id, schema.users.uid)
            )
            .leftJoin(
                schema.subjects,
                eq(schema.subjects.id, schema.teacherClasses.subject_id)
            )
            .where(
                eq(schema.teacherClasses.class_id, class_id)
            );

        let class_info = {
            id: class_.id,
            name: class_.name,
            students: students,
            teachers: teachers
        }

        return NextResponse.json({
            success: true,
            class: class_info
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}