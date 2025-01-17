import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {
    db_log,
    return_400, return_404, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {and, arrayContains, asc, desc, eq, like, ne, sql} from 'drizzle-orm';
import {QueryBuilder} from "drizzle-orm/mysql-core";
import {arrayContained, inArray} from "drizzle-orm/sql/expressions/conditions";


/**
 * @swagger
 * /api/user/alert/read:
 *   put:
 *     summary: Mark alerts as read
 *     description: Marks specific alerts for the logged-in user as read.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alert:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Successfully marked alerts as read.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request, either no alert IDs provided or alerts not found.
 *       401:
 *         description: Not logged in or user not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(req: NextRequest) {
    try {
        return await db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            let user_id = decoded.user_id;

            const data = await req.json();
            let alert_ids = data.alert
            if (alert_ids.length === 0) return return_400('No alert_id provided');

            let alerts = await tx.select()
                .from(schema.alerts)
                .where(and(
                    eq(schema.alerts.user_id, user_id),
                    inArray(schema.alerts.id, alert_ids)
                ));
            if (alerts.length !== alert_ids.length) return return_400('Some alerts not found');

            await tx.update(schema.alerts)
                .set({ read: 1 })
                .where(inArray(schema.alerts.id, alert_ids))

            return NextResponse.json({ success: true });
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}