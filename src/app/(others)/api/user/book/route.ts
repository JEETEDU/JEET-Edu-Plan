import type { NextRequest } from 'next/server'
import { db } from '@/database'
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
 * /api/user/book:
 *   get:
 *     summary: Get books
 *     description: Retrieves a list of books for the logged-in user, with optional filtering by title.
 *     tags:
 *       - Books
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: Unauthorized, user not logged in
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        const decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const user_id = decoded.user_id;
        const data = req.nextUrl.searchParams;
        const limit = parseInt(data.get('limit') ?? '10');
        const offset = parseInt(data.get('offset') ?? '0');
        const title = data.get('title') ?? '';

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

/**
 * @swagger
 * /api/user/book:
 *   post:
 *     summary: Register a new book
 *     description: Allows a student to register a new book with details like title, author, publisher, and content.
 *     tags:
 *       - Books
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the book
 *                 example: "Book Title"
 *               author:
 *                 type: string
 *                 description: The author of the book
 *                 example: "Author Name"
 *               publisher:
 *                 type: string
 *                 description: The publisher of the book
 *                 example: "Publisher Name"
 *               content:
 *                 type: string
 *                 description: The content of the book
 *                 example: "Book content"
 *     responses:
 *       200:
 *         description: Book registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, invalid or missing required fields
 *       401:
 *         description: Unauthorized, user not logged in or lacks permissions
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
    try {
        return await db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();
            if (decoded.user_type !== UserType.STUDENT) return return_400('Only students can register books');

            const data = await req.json();
            const title = data.title ?? '';
            const author = data.author ?? '';
            const publisher = data.publisher ?? '';
            const content = data.content ?? '';

            if (!title) return return_400('Title is required');
            if (title.length > 255) return return_400('Title is too long');
            if (author && author.length > 255) return return_400('Author is too long');
            if (publisher && publisher.length > 255) return return_400('Publisher is too long');
            if (!content) return return_400('Content is required');

            await tx.insert(schema.books).values({
                user_id: decoded.user_id,
                title: title,
                content: content,
                author: author,
                publisher: publisher
            });

            return NextResponse.json({
                success: true
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/user/book:
 *   delete:
 *     summary: Delete a book
 *     description: Allows a student to delete a book they have registered.
 *     tags:
 *       - Books
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: integer
 *                 description: The ID of the book to delete
 *                 example: 1
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, invalid or missing required fields
 *       401:
 *         description: Unauthorized, user not logged in or lacks permissions
 *       500:
 *         description: Internal server error
 */
export async function DELETE(req: NextRequest) {
    try {
        return await db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.json();
            const book_id = data.book_id;

            if (!book_id) return return_400('Book ID is required');

            const [book] = await tx.select({
                id: schema.books.id
            }).from(schema.books)
                .where(
                    and(
                        eq(schema.books.user_id, decoded.user_id),
                        eq(schema.books.id, book_id)
                    )
                );
            if (!book) return return_400('Book not found');

            await tx.delete(schema.books)
                .where(
                    and(
                        eq(schema.books.user_id, decoded.user_id),
                        eq(schema.books.id, book_id)
                    )
                );

            return NextResponse.json({
                success: true
            });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}

/**
 * @swagger
 * /api/user/book:
 *   put:
 *     summary: Update a book
 *     description: Allows a student to update the details of a book they have registered.
 *     tags:
 *       - Books
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: integer
 *                 description: The ID of the book to update
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: The title of the book
 *                 example: "Updated Book Title"
 *               author:
 *                 type: string
 *                 description: The author of the book
 *                 example: "Updated Author Name"
 *               publisher:
 *                 type: string
 *                 description: The publisher of the book
 *                 example: "Updated Publisher Name"
 *               content:
 *                 type: string
 *                 description: The content of the book
 *                 example: "Updated book content"
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, invalid or missing required fields
 *       401:
 *         description: Unauthorized, user not logged in or lacks permissions
 *       500:
 *         description: Internal server error
 */
export async function PUT(req: NextRequest) {
    try {
        return await db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.json();
            const book_id = data.book_id;
            const title = data.title ?? '';
            const author = data.author ?? '';
            const publisher = data.publisher ?? '';
            const content = data.content ?? '';

            if (!book_id) return return_400('Book ID is required');
            if (!title) return return_400('Title is required');
            if (title.length > 255) return return_400('Title is too long');
            if (author && author.length > 255) return return_400('Author is too long');
            if (publisher && publisher.length > 255) return return_400('Publisher is too long');
            if (!content) return return_400('Content is required');

            const [book] = await tx.select({
                id: schema.books.id
            }).from(schema.books)
                .where(
                    and(
                        eq(schema.books.user_id, decoded.user_id),
                        eq(schema.books.id, book_id)
                    )
                );
            if (!book) return return_400('Book not found');

            await tx.update(schema.books)
                .set({
                    title: title,
                    content: content,
                    author: author,
                    publisher: publisher
                })
                .where(
                    and(
                        eq(schema.books.user_id, decoded.user_id),
                        eq(schema.books.id, book_id)
                    )
                );

            return NextResponse.json({
                success: true
            });
        });
    }
    catch (e) {
        console.error(e);
        return return_500();
    }
}