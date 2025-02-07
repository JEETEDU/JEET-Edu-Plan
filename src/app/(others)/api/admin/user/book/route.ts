import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {
    check_date_string,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {and, count, desc, eq, like, sql} from 'drizzle-orm';

/**
 * @swagger
 * /api/user/book:
 *   get:
 *     summary: Get books
 *     description: Retrieves a list of books for the user, with optional filtering by title.
 *     tags:
 *       - Admin/User
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of books to return.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: The number of books to skip before starting to collect the result set.
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter books by title.
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Book Title"
 *                       author:
 *                         type: string
 *                         example: "Author Name"
 *                       publisher:
 *                         type: string
 *                         example: "Publisher Name"
 *                       content:
 *                         type: string
 *                         example: "Book content"
 *       400:
 *         description: Invalid limit or offset
 *       401:
 *         description: Unauthorized, user not logged in or not a admin
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        const decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();
        if (decoded.user_type !== UserType.ADMIN) return return_permission_denied();

        const data = req.nextUrl.searchParams;
        const user_id = parseInt(data.get('user_id') ?? '0')
        const limit = parseInt(data.get('limit') ?? '10');
        const offset = parseInt(data.get('offset') ?? '0');
        const title = data.get('title') ?? '';

        if (user_id === 0) return return_400('Invalid user_id')
        if (limit < 1 || offset < 0) return return_400('Invalid limit or offset');

        const books =
            await db.select()
                .from(schema.books)
                .where(
                    and(
                        eq(schema.books.user_id, user_id),
                        like(schema.books.title, `%${title}%`)
                    )
                )
                .orderBy(desc(schema.books.id))
                .limit(limit)
                .offset(offset);

        return NextResponse.json({
            success: true,
            books: books
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}