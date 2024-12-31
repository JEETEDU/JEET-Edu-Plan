import type { NextRequest } from 'next/server'
import { db } from '@/database'
import * as schema from '@/database/schema'
import crypto from 'crypto'
import {NextResponse} from "next/server";
import {eq} from "drizzle-orm";
import {generateToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {return_400, return_500} from "@/app/(others)/api/(tools)/tools";

/**
 * @swagger
 * /api/user/register:
 *  post:
 *      tags:
 *          - User
 *      description: Register a new user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: User's name
 *                              example: "John"
 *                              maxLength: 5
 *                          login_id:
 *                              type: string
 *                              description: User's login id
 *                              example: "john123"
 *                              maxLength: 20
 *                          pw:
 *                              type: string
 *                              description: User's password
 *                              example: "password"
 *                              minLength: 8
 *                      required:
 *                          - name
 *                          - login_id
 *                          - pw
 *      responses:
 *          "200":
 *              description: Register successful
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
 *                                  example: "Register successful"
 *          "400":
 *              description: Bad request
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
 *                                  example: "Please fill out all fields"
 */
export async function POST(req: NextRequest) {
    try {
        return await db.transaction(async (tx) => {
            const token: string = req.cookies.get("token")?.value ?? '';
            if (token) {
                let decoded = verifyToken(token);
                if (decoded) {
                    return return_400("Already logged in");
                }
            }

            const data = await req.json();
            let name = data.name;
            let login_id = data.login_id;
            let pw = data.pw;

            if (!login_id || !name || !pw) {
                return NextResponse.json({
                    success: false,
                    message: "Please fill out all fields",
                }, {status: 400});
            }

            name = name.toString().trim();
            login_id = login_id.toString().trim();
            pw = pw.toString().trim();

            // check length
            if (pw.length < 8) {
                return NextResponse.json({
                    success: false,
                    message: "Password must be at least 8 characters long",
                }, {status: 400});
            }
            if (name.length > 5) {
                return NextResponse.json({
                    success: false,
                    message: "Name must be less than 5 characters long",
                }, {status: 400});
            }
            if (login_id.length > 20) {
                return NextResponse.json({
                    success: false,
                    message: "Login ID must be less than 20 characters long",
                }, {status: 400});
            }

            // @ts-ignore
            await tx.insert(schema.usersTable).values(
                {
                    login_id: login_id,
                    pw: crypto.createHash('sha256').update(pw).digest(),
                    user_type: 0,
                    name: name,
                });

            // set token
            let [user] = await tx.select()
                .from(schema.usersTable)
                .where(eq(schema.usersTable.login_id, login_id));

            let new_token = generateToken(user.uid, user.user_type);
            let res = NextResponse.json({
                success: true,
                message: "Register successful"
            })
            res.cookies.set("token", new_token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 3 * 60 * 60,
                secure: true
            });
            return res;
        });
    } catch (e: any) {
        if (e.code == 'ER_DUP_ENTRY') {
            return return_400("User id already exists");
        }
        console.error(e);
        return return_500();
    }
}