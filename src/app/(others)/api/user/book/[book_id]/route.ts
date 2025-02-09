import type {NextRequest} from 'next/server'
import {db} from '@/database'
import * as schema from '@/database/schema'
import {NextResponse} from "next/server";
import {eq, and, sql, count, SQL, desc, like} from "drizzle-orm";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {
    return_400,
    return_500,
    return_not_logged_in,
    todayString,
    UserType
} from "@/app/(others)/api/(tools)/tools";

/**
 * @swagger
 * /api/user/book/{book_id}:
 *   get:
 *     summary: Retrieve a book
 *     description: Allows a student to retrieve the details of a book they have registered.
 *     tags:
 *       - Books
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: book_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the book to retrieve
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 book:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     author:
 *                       type: string
 *                     publisher:
 *                       type: string
 *                     content:
 *                       type: string
 *       400:
 *         description: Bad request, invalid or missing required fields
 *       401:
 *         description: Unauthorized, user not logged in or lacks permissions
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest, {params}: { params: Promise<{ book_id: number }> }) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        const decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const book_id = (await params).book_id;
        if (!book_id) return return_400('book_id is required');

        const book =
            await db.select()
                .from(schema.books)
                .where(
                    and(
                        eq(schema.books.id, book_id),
                        eq(schema.books.user_id, decoded.user_id)
                    )
                );
        if (!book) return return_400('Book not found');
        if (book.length === 0) return return_400('Book not found');

        return NextResponse.json({
            success: true,
            book: book[0]
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}