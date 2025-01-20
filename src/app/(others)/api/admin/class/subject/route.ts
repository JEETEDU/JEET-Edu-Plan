import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, count, eq, like, sql} from 'drizzle-orm';
import {
    db_log,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {check_admin_permission} from "@/app/(others)/api/admin/(tools)/tools";
import {QueryBuilder} from "drizzle-orm/mysql-core";
import {subjects} from "@/database/schema";


/**
 * @swagger
 * /api/admin/class/subject:
 *   get:
 *     summary: Get subjects for the class
 *     description: Retrieves a list of subjects for the specified class ID.
 *     tags:
 *       - Admin/Class
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: class_id
 *         in: query
 *         description: The ID of the class to retrieve subjects for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subjects successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                   example: true
 *                 subjects:
 *                   type: array
 *                   description: List of subjects and relevant details.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123"
 *                       name:
 *                         type: string
 *                         example: "Mathematics"
 *                       class_:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "456"
 *                           name:
 *                             type: string
 *                             example: "Class 10A"
 *                       teachers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             uid:
 *                               type: string
 *                               example: "789"
 *                             name:
 *                               type: string
 *                               example: "John Doe"
 *       400:
 *         description: Invalid class ID provided in the request.
 *       403:
 *         description: Insufficient permissions to perform the operation.
 *       500:
 *         description: Internal server error. An unexpected issue occurred on the server side.
 */
export async function GET(req: NextRequest) {
    try {
        let token: DecodedToken | NextResponse = check_admin_permission(req.cookies.get("token")?.value ?? '');
        if (token instanceof NextResponse) return token;

        const data = req.nextUrl.searchParams;
        const class_id = data.get('class_id') ?? '';

        let rows = await db.select({
            id: schema.subjects.id,
            name: schema.subjects.name,
            class_: {
                class_id: sql`class_info.id`,
                class_name: sql`class_info.name`,
            },
            teacher: {
                uid: sql`user.uid`,
                name: sql`user.name`,
            }
        })
            .from(schema.subjects)
            .leftJoin(
                schema.classes,
                eq(schema.subjects.class_id, schema.classes.id)
            )
            .leftJoin(
                schema.teacherClasses,
                and(eq(schema.teacherClasses.class_id, schema.classes.id),
                    eq(schema.teacherClasses.subject_id, schema.subjects.id))
            )
            .leftJoin(
                schema.users,
                eq(schema.teacherClasses.user_id, schema.users.uid)
            )
            .where(
                // @ts-ignore
                eq(schema.classes.id, class_id)
            );

        let subjects = Array.isArray(rows) ? rows.reduce((acc: any, row: any) => {
            let subject = acc.find((u: any) => u.id === row.id);
            console.log(subject);
            if (!subject) {
                subject = {
                    id: row.id,
                    name: row.name,
                    class_: {
                        id: row.class_?.class_id,
                        name: row.class_?.class_name
                    },
                    teachers: []
                };
                acc.push(subject);
            }
            if (row.teacher?.uid) {
                subject.teachers.push({
                    uid: row.teacher.uid,
                    name: row.teacher.name
                });
            }
            return acc;
        }, []) : [];

        return NextResponse.json({
            success: true,
            subjects: subjects
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/admin/class/subject:
 *   post:
 *     summary: Create a new subject
 *     description: Creates a new subject for the specified class ID.
 *     tags:
 *       - Admin/Class
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               class_id:
 *                 type: string
 *                 description: The ID of the class where the subject will be added.
 *                 example: "456"
 *               name:
 *                 type: string
 *                 description: The name of the subject to be created.
 *                 example: "Physics"
 *     responses:
 *       200:
 *         description: Subject successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: Subject created
 *       400:
 *         description: Invalid input or subject already exists.
 *       403:
 *         description: Insufficient permissions to perform the operation.
 *       500:
 *         description: Internal server error. An unexpected issue occurred on the server side.
 */
export async function POST(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            let token: DecodedToken | NextResponse = check_admin_permission(req.cookies.get("token")?.value ?? '');
            if (token instanceof NextResponse) return token;

            const data = await req.json();
            const class_id = data.class_id;
            const name = data.name?.toString()

            if (!class_id || !name) return return_400("Missing required fields.");
            if (name.length > 255) return return_400("Subject name is too long.");

            let [class_] =
                await tx.select({
                    id: schema.classes.id,
                    subject: count(schema.subjects.id)
                })
                    .from(schema.classes)
                    .leftJoin(
                        schema.subjects,
                        and(
                            eq(schema.subjects.class_id, schema.classes.id),
                            eq(schema.subjects.name, name)
                        )
                    )
                    .where(
                        eq(schema.classes.id, class_id)
                    );
            if (!class_) {
                return return_400('Class not found');
            }
            if (class_.subject > 0) {
                return return_400('Subject already exists');
            }

            const [subject_id] = await tx.insert(schema.subjects).values({
                class_id: class_id,
                name: name
            }).$returningId();

            await db_log(tx, token.user_id, `Created subject ${subject_id}(name: ${name}) for class ${class_id}`);

            return NextResponse.json({
                success: true,
                message: 'Subject created'
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/admin/class/subject:
 *   delete:
 *     summary: Delete a subject
 *     description: Deletes a specific subject by its ID.
 *     tags:
 *       - Admin/Class
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject_id:
 *                 type: string
 *                 description: The ID of the subject to be deleted.
 *                 example: "789"
 *     responses:
 *       200:
 *         description: Subject successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: Subject deleted
 *       400:
 *         description: Missing required fields or subject not found.
 *       403:
 *         description: Insufficient permissions to perform the operation.
 *       500:
 *         description: Internal server error. An unexpected issue occurred on the server side.
 */
export async function DELETE(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            let token: DecodedToken | NextResponse = check_admin_permission(req.cookies.get("token")?.value ?? '');
            if (token instanceof NextResponse) return token;

            const data = await req.json();
            const subject_id = data.subject_id?.toString();

            if (!subject_id) return return_400("Missing required fields.");

            let [subject] =
                await tx.select({
                    id: schema.subjects.id,
                    name: schema.subjects.name,
                    class_id: schema.subjects.class_id
                })
                    .from(schema.subjects)
                    .where(
                        eq(schema.subjects.id, subject_id)
                    );
            if (!subject) {
                return return_400('Subject not found');
            }

            await tx.delete(schema.subjects)
                .where(
                    eq(schema.subjects.id, subject_id)
                );

            await db_log(tx, token.user_id, `Deleted subject ${subject_id}(name: ${subject.name}) for class ${subject.class_id}`);

            return NextResponse.json({
                success: true,
                message: 'Subject deleted'
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}