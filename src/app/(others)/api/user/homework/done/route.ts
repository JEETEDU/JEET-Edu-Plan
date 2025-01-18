import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, asc, count, desc, eq, like, or, SQL, sql} from 'drizzle-orm';
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
 * /api/user/homework/done:
 *   put:
 *     summary: Updates a user's homework status to "done".
 *     description: Marks a homework item as "done" for a student based on the given `article_id`. The user must be logged in and have permission to update it.
 *     tags:
 *       - Homework
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - article_id
 *             properties:
 *               article_id:
 *                 type: integer
 *                 description: The ID of the article/homework to mark as done.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Successfully marked homework as done.
 *       400:
 *         description: Bad Request. Either the `article_id` is invalid, or the homework could not be found.
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
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();
            
            const user_id = decoded.user_id;
            const user_type = decoded.user_type;
            if (user_type !== UserType.STUDENT) return return_permission_denied();
            
            const data = await req.json();
            const article_id = parseInt(data.article_id ?? '');
            if(Number.isNaN(article_id)) return return_400('Invalid article_id');
            
            const [homework] = 
                await tx.select()
                    .from(schema.homeworks)
                    .where(and(eq(schema.homeworks.article_id, article_id), 
                        eq(schema.homeworks.user_id, user_id)));
            if (!homework) return return_400('Homework not found')
            
            await tx.update(schema.homeworks)
                .set({done: 1})
                .where(and(eq(schema.homeworks.article_id, article_id), 
                    eq(schema.homeworks.user_id, user_id)));
            
            return NextResponse.json({success: true});
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}