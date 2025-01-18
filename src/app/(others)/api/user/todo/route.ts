import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, asc, count, desc, eq, gte, like, lte, or, SQL, sql} from 'drizzle-orm';
import {
    check_date_string,
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {QueryBuilder} from "drizzle-orm/mysql-core";
import {delete_files, save_files, SavedFileList, update_files} from "@/app/(others)/api/(tools)/files";
import {AlertType, register_alert, register_alert_for_class} from "@/app/(others)/api/(tools)/alerts";
import {ArticleCategory} from "@/app/(others)/api/board/tools";


/**
 * @swagger
 * /api/user/todo:
 *   post:
 *     summary: Create a new to-do item.
 *     description: This API endpoint allows a user to create a new to-do item by providing its content and an optional due date. Due date is not required.
 *     tags:
 *       - To-Do
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: The due date for the to-do item in ISO 8601 format. Must be a future date.
 *               content:
 *                 type: string
 *                 description: The content or description of the to-do item.
 *             required:
 *               - content
 *     responses:
 *       200:
 *         description: The to-do item was created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *       400:
 *         description: Bad request. The request body is invalid or missing required data.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Content is required."
 *       401:
 *         description: Unauthorized. The user is not logged in.
 *       500:
 *         description: Internal server error. An unexpected error occurred on the server.
 */
export async function POST(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const user_id = decoded.user_id;

            const data = await req.json();
            const due_date = data.due_date ?? null;
            const content = data.content ?? '';
            if (due_date) {
                if (!check_date_string(due_date)) return return_400("Invalid date format.");
                if (new Date(due_date) < new Date()) return return_400("Due date must be in the future.");
            }
            if (!content) return return_400("Content is required.");

            await tx.insert(schema.todoes)
                .values({
                    user_id: user_id,
                    due_date: due_date,
                    content: content
                })

            return NextResponse.json({success: true});
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/user/todo:
 *   patch:
 *     summary: Update an existing to-do item.
 *     description: This API endpoint allows a user to update an existing to-do item by providing its ID and updated values such as content or due date. At least one field (content or due_date) must be provided. Give -1 as the due_date to remove it.
 *     tags:
 *       - To-Do
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               todo_id:
 *                 type: integer
 *                 description: The ID of the to-do item to be updated.
 *               due_date:
 *                 type: string
 *                 format: date
 *                 description: The updated due date for the to-do item in ISO 8601 format. Must be a future date.
 *               content:
 *                 type: string
 *                 description: The updated content or description of the to-do item.
 *             required:
 *               - todo_id
 *     responses:
 *       200:
 *         description: The to-do item was updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *       400:
 *         description: Bad request. The request body is invalid, missing required data, or the specified to-do item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid todo_id"
 *       401:
 *         description: Unauthorized. The user is not logged in.
 *       500:
 *         description: Internal server error. An unexpected error occurred on the server.
 */
export async function PATCH(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const user_id = decoded.user_id;

            const data = await req.json();
            const todo_id = parseInt(data.todo_id ?? '');
            if (Number.isNaN(todo_id)) return return_400('Invalid todo_id');
            const content = data.content ?? '';
            const due_date = data.due_date ?? null;
            if (due_date && due_date !== -1) {
                if (!check_date_string(due_date)) return return_400("Invalid date format.");
                if (new Date(due_date) < new Date()) return return_400("Due date must be in the future.");
            }

            if (!content && !due_date) return return_400("Content or due_date is required.");

            const [todo] =
                await tx.select()
                    .from(schema.todoes)
                    .where(and(eq(schema.todoes.id, todo_id), eq(schema.todoes.user_id, user_id)));
            if (!todo) return return_400('To-do item not found');

            let values: any = {};
            if (content) values.content = content;
            if (due_date) values.due_date = due_date;
            if (due_date === -1) values.due_date = null;

            await tx.update(schema.todoes)
                .set(values)
                .where(and(eq(schema.todoes.id, todo_id), eq(schema.todoes.user_id, user_id)));

            return NextResponse.json({success: true});
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/user/todo:
 *   delete:
 *     summary: Delete an existing to-do item.
 *     description: This API endpoint allows a user to delete an existing to-do item by providing its ID.
 *     tags:
 *       - To-Do
 *     parameters:
 *       - in: query
 *         name: todo_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the to-do item to be deleted.
 *     responses:
 *       200:
 *         description: The to-do item was deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *       400:
 *         description: Bad request. The request is invalid or missing required data.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid todo_id"
 *       401:
 *         description: Unauthorized. The user is not logged in.
 *       500:
 *         description: Internal server error. An unexpected error occurred on the server.
 */
export async function DELETE(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const user_id = decoded.user_id;

            const todo_id = parseInt(new URL(req.url).searchParams.get("todo_id") ?? '');
            if (Number.isNaN(todo_id)) return return_400('Invalid todo_id');

            const [todo] =
                await tx.select()
                    .from(schema.todoes)
                    .where(and(eq(schema.todoes.id, todo_id), eq(schema.todoes.user_id, user_id)));
            if (!todo) return return_400('To-do item not found');

            await tx.delete(schema.todoes)
                .where(and(eq(schema.todoes.id, todo_id), eq(schema.todoes.user_id, user_id)));

            return NextResponse.json({success: true});
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/user/todo:
 *   get:
 *     summary: Retrieve to-do items for a student.
 *     description: This API endpoint allows a student to retrieve their to-do items, with optional filters and pagination.
 *     tags:
 *       - To-Do
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number for pagination. Default is 1.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: The number of to-do items per page. Default is 10.
 *       - in: query
 *         name: done
 *         schema:
 *           type: integer
 *           enum: [-1, 0, 1]
 *         required: false
 *         description: Filter by completion status. -1 (all), 0 (not done), 1 (done). Default is -1.
 *       - in: query
 *         name: start_due_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter to-do items with a due date starting from this date. Must be in YYYY-MM-DD format.
 *       - in: query
 *         name: end_due_date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter to-do items with a due date up to this date. Must be in YYYY-MM-DD format.
 *     responses:
 *       200:
 *         description: Successfully retrieved to-do items.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 todoes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       due_date:
 *                         type: string
 *                         format: date
 *                         description: The due date of the to-do item.
 *                       done:
 *                         type: boolean
 *                         description: Indicates whether the to-do item is done.
 *                       content:
 *                         type: string
 *                         description: The content of the to-do item.
 *       400:
 *         description: Bad request. Invalid query parameters or date formats.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid value for 'done'."
 *       401:
 *         description: Unauthorized. The user is not logged in.
 *       403:
 *         description: Forbidden. The user does not have permission to access this resource.
 *       500:
 *         description: Internal server error. An unexpected error occurred on the server.
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        let decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const user_id = decoded.user_id;
        const user_type = decoded.user_type;
        if(user_type !== UserType.STUDENT) return return_permission_denied();

        const data = req.nextUrl.searchParams;
        const page = parseInt(data.get('page') ?? '1');
        const limit = parseInt(data.get('limit') ?? '10');
        const done = parseInt(data.get('done') ?? '-1');
        const end_due_date = data.get('end_due_date') ?? '';
        const start_due_date = data.get('start_due_date') ?? '';

        if(Number.isNaN(done) || done < -1 || done > 1) return return_400("Invalid value for 'done'.");
        if(start_due_date && !check_date_string(start_due_date)) return return_400("Invalid date format for 'start_due_date'.");
        if(end_due_date && !check_date_string(end_due_date)) return return_400("Invalid date format for 'end_due_date'.");

        let query = (new QueryBuilder())
            .select({
                due_date: schema.todoes.due_date,
                done: schema.todoes.done,
                content: schema.todoes.content,
            })
            .from(schema.todoes)
            .$dynamic();
        let where_clause: SQL<any> | undefined = eq(schema.todoes.user_id, user_id);
        if(done !== -1) where_clause = and(where_clause, eq(schema.todoes.done, done));
        if(start_due_date) where_clause = and(where_clause, gte(schema.todoes.due_date, new Date(start_due_date)));
        if(end_due_date) where_clause = and(where_clause, lte(schema.todoes.due_date, new Date(end_due_date)));
        query = query.where(where_clause).limit(limit).offset((page - 1) * limit);

        let [todoes] = await db.execute(query);

        return NextResponse.json({
            success: true,
            // @ts-ignore
            todoes: todoes?.map((h) => ({
                due_date: h.due_date,
                done: h.done,
                contnet: h.content,
            }))
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}