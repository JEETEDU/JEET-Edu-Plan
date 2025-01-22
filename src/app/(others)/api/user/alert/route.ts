import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {
    return_400, return_500,
    return_not_logged_in
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {and, asc, eq, sql} from 'drizzle-orm';

/**
 * @swagger
 * /api/user/alert:
 *   get:
 *     summary: Get alerts for the user
 *     description: Get alerts for the user
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: unread
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Whether to get only unread alerts.
 *     responses:
 *       200:
 *         description: The alerts have been retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       message:
 *                         type: string
 *                       read:
 *                         type: integer
 *                       alert_type:
 *                         type: integer
 *                       article_id:
 *                         type: integer
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        const decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const data = req.nextUrl.searchParams;
        const unread = data.get('unread') === 'true';

        const user_id = decoded.user_id;

        const alerts =
            await db.select()
                .from(schema.alerts)
                .where(and(
                    eq(schema.alerts.user_id, user_id),
                    unread ? eq(schema.alerts.read, 0) : sql`1`
                    ))
                .limit(20)
                .orderBy(asc(schema.alerts.id));

        return NextResponse.json({
            success: true,
            alerts: alerts
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}


/**
 * @swagger
 * /api/user/alert:
 *   delete:
 *     summary: Delete a specific alert for the user
 *     description: Deletes a specific alert belonging to the authenticated user based on the provided alert ID.
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: alert_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the alert to delete.
 *     responses:
 *       200:
 *         description: The alert has been successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid alert ID or alert not found.
 *       401:
 *         description: Not logged in or user not found.
 *       500:
 *         description: Server error.
 */
export async function DELETE(req: NextRequest) {
    try {
        return await db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            const decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const user_id = decoded.user_id;

            const data = req.nextUrl.searchParams;
            const alert_id = parseInt(data.get('alert_id') ?? '');

            const [alert] =
                await db.select()
                    .from(schema.alerts)
                    .where(and(
                        eq(schema.alerts.user_id, user_id),
                        eq(schema.alerts.id, alert_id)
                    ));
            if (!alert) return return_400('Alert not found');

            await db.delete(schema.alerts)
                .where(and(
                    eq(schema.alerts.user_id, user_id),
                    eq(schema.alerts.id, alert_id)
                ));

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}