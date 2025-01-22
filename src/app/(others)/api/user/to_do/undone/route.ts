import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, eq} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";


/**
 * @swagger
 * /api/user/to_do/undone:
 *   put:
 *     summary: Updates a user's tdod status to "incomplete".
 *     description: Marks a tdod item as "incomplete" for a student based on the given `tdod_ig`. The user must be logged in and have permission to update it.
 *     tags:
 *       - To-Do
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - todo_id
 *             properties:
 *               todo_id:
 *                 type: integer
 *                 description: The ID of the to_do to mark as done.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully marked homework as done.
 *       400:
 *         description: Bad Request. Either the `todo_id` is invalid, or the homework could not be found.
 *       401:
 *         description: Unauthorized. The user is not logged in.
 *       403:
 *         description: Forbidden. The user does not have permission to update this homework.
 *       500:
 *         description: Internal Server Error. An unexpected error occurred.
 */
export async function PUT(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const user_id = decoded.user_id;
            const user_type = decoded.user_type;
            if (user_type !== UserType.STUDENT) return return_permission_denied();

            const data = await req.json();
            const todo_id = parseInt(data.todo_id ?? '');
            if(Number.isNaN(todo_id)) return return_400('Invalid todo_id');

            const [homework] =
                await tx.select()
                    .from(schema.todoes)
                    .where(and(eq(schema.todoes.id, todo_id),
                        eq(schema.todoes.user_id, user_id)));
            if (!homework) return return_400('Homework not found')

            await tx.update(schema.todoes)
                .set({done: 0})
                .where(and(eq(schema.todoes.id, todo_id),
                    eq(schema.todoes.user_id, user_id)));

            return NextResponse.json({success: true});
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}