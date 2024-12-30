import type { NextApiResponse } from 'next'
import type { NextRequest } from 'next/server'
import { db } from '@/database'
import * as schema from '@/database/schema'
import crypto from 'crypto'
import {NextResponse} from "next/server";
import {and, or, eq, DrizzleError} from "drizzle-orm";
import {return_400} from "@/app/(others)/api/tools";
import {setCookie} from "undici-types";
import {generateToken, verifyToken} from "@/app/(others)/api/auth";

/**
 * @swagger
 * /api/user/login:
 *  post:
 *      tags:
 *          - User
 *      description: Login
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          login_id:
 *                              type: string
 *                              description: User's login id
 *                              example: "john123"
 *                          pw:
 *                              type: string
 *                              description: User's password
 *                              example: "password"
 *                      required:
 *                          - login_id
 *                          - pw
 *      responses:
 *          "200":
 *              description: Login successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  example: "Login successful"
 *              headers:
 *                  Set-Cookie:
 *                      schema:
 *                          type: string
 *          "400":
 *              description: Login failed
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              message:
 *                                  type: string
 *                                  example: "error message"
 */
export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        let login_id = data.get("login_id");
        let pw = data.get("pw");

        const token: string = req.cookies.get("token")?.value ?? '';
        if (token) {
            let decoded = verifyToken(token);
            if (decoded) {
                return NextResponse.json({
                    success: true,
                    message: "Already logged in"
                }, {status: 200});
            }
        }

        if (!login_id || !pw) {
            return return_400("Please fill out all fields");
        }

        login_id = login_id.toString().trim();
        let pw_hash: Buffer = crypto.createHash('sha256').update(pw.toString().trim()).digest();

        let query_result =
            await db.select()
                .from(schema.usersTable)
                .where(
                    and(
                        eq(schema.usersTable.login_id, login_id),
                        // @ts-ignore
                        eq(schema.usersTable.pw, pw_hash)
                    )
                );

        if (query_result.length == 0) return return_400("Cannot find user or password is incorrect");

        let user = query_result[0];
        if (user.user_type == 0) {
            return return_400("User has not been approved yet");
        }

        // set token
        let new_token = generateToken(user.uid, user.user_type);

        let res = NextResponse.json({
            success: true,
            message: "Login successful"
        })
        res.cookies.set("token", new_token, { path: '/', httpOnly: true, sameSite: 'strict', maxAge: 60*60, secure: true });

        return res;

    } catch (e) {
        console.error(e);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, {status: 500});
    }
}