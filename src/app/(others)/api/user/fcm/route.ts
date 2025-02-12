import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, desc, eq, sql} from 'drizzle-orm';
import {
    return_400,
    return_500,
    return_not_logged_in,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";

/**
 * @swagger
 * /api/user/fcm:
 *   post:
 *     summary: Register FCM token
 *     description: Allows a user to register their FCM token.
 *     tags:
 *       - User/FCM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcm_token:
 *                 type: string
 *                 description: The FCM token to register
 *                 example: "your_fcm_token_here"
 *     responses:
 *       200:
 *         description: FCM token registered successfully
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
        return await db.transaction(async (db) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.json();
            const fcm_token = data.fcm_token;

            if (!fcm_token) return return_400('Missing required fields');

            await db.insert(schema.fcm)
                .values({
                    user_id: decoded.user_id,
                    token: fcm_token
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
 * /api/user/fcm:
 *   delete:
 *     summary: Delete FCM token
 *     description: Deletes the user's FCM token.
 *     tags:
 *       - User/FCM
 *     responses:
 *       200:
 *         description: FCM token deleted successfully
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
        return await db.transaction(async (db) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            await db.delete(schema.fcm)
                .where(
                    eq(schema.fcm.user_id, decoded.user_id)
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