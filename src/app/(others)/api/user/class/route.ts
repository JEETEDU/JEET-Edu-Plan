import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, eq} from 'drizzle-orm';
import {
    return_400, return_500,
    return_not_logged_in,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";


/**
 * @swagger
 * /api/user/class:
 *   get:
 *     summary: Get a list of classes for the logged-in user
 *     description: Retrieves a list of classes visible to the logged-in user based on their user type (student or teacher). Students see their enrolled classes, and teachers see the classes they manage.
 *     tags:
 *       - Class
 *       - User
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of classes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 12
 *                       name:
 *                         type: string
 *                         example: "G3 K"
 *                       description:
 *                         type: string
 *                         example: "Class for grade 3 students"
 *       400:
 *         description: Missing parameters or bad input.
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
 *                   example: "Invalid request."
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
 *                   example: "Not logged in."
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
        } else {
            return return_not_logged_in();
        }

        let classes;
        if (decoded.user_type == UserType.STUDENT) {
            classes = await db.select({
                id: schema.classes.id,
                name: schema.classes.name,
                description: schema.classes.description
            })
                .from(schema.classes)
                .leftJoin(
                    schema.studentClasses,
                    eq(schema.studentClasses.class_id, schema.classes.id)
                )
                .leftJoin(
                    schema.users,
                    eq(schema.studentClasses.user_id, schema.users.uid)
                )
                .where(
                    and(
                        eq(schema.studentClasses.user_id, decoded.user_id),
                        eq(schema.classes.display, 1)
                    )
                );
        } else {
            classes = await db.select({
                class_id: schema.classes.id,
                class_name: schema.classes.name,
                description: schema.classes.description,
            })
                .from(schema.classes)
                .leftJoin(
                    schema.teacherClasses,
                    eq(schema.teacherClasses.class_id, schema.classes.id)
                )
                .leftJoin(
                    schema.users,
                    eq(schema.teacherClasses.user_id, schema.users.uid)
                )
                .where(
                    and(
                        eq(schema.teacherClasses.user_id, decoded.user_id),
                        eq(schema.classes.display, 1)
                    )
                );
        }

        return NextResponse.json({
            success: true,
            classes: classes
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}