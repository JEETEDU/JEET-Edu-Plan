import {NextRequest, NextResponse} from "next/server";
import {db} from "@/database";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {
    db_log,
    return_400, return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import * as schema from "@/database/schema";
import {eq} from "drizzle-orm";
import crypto from "crypto";

/**
 * @swagger
 * /api/user/reset_password:
 *   post:
 *     summary: Reset the password for a user
 *     description: Changes the password of the logged-in user after validating the provided new password.
 *     tags:
 *       - User/Account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_password
 *             properties:
 *               new_password:
 *                 type: string
 *                 description: The new password for the user. Must be at least 8 characters long.
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset for user {user_id}
 *       400:
 *         description: Bad request. Possibly missing or invalid `new_password`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: new_password is required
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not logged in
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An internal server error occurred
 */
export async function POST(req: NextRequest) {
    try {
        return db.transaction(async (tx) => {
            const token = req.cookies.get("token")?.value ?? '';
            let decoded: DecodedToken | false = verifyToken(token);
            if (!decoded) return return_not_logged_in();

            const data = await req.json();
            let pw = data.new_password?.toString() ?? '';
            if (!pw) return return_400('new_password is required');
            if (pw.length < 8) return return_400('Password must be at least 8 characters long');

            const user_id = decoded.user_id;
            await tx.update(schema.users)
                .set({
                    //@ts-ignore
                    pw: crypto.createHash('sha256').update(pw).digest()
                })
                .where(eq(schema.users.uid, user_id));

            return NextResponse.json({
                success: true,
                message: `Password reset for user ${user_id}`
            }, {headers: {"Set-Cookie": "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"}});
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}
