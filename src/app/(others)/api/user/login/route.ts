import type { NextApiResponse } from 'next'
import type { NextRequest } from 'next/server'
import { db } from '@/database'
import * as schema from '@/database/schema'
import crypto from 'crypto'
import {NextResponse} from "next/server";
import {and, or, eq, DrizzleError} from "drizzle-orm";
import {return_400} from "@/app/(others)/api/tools";
import {setCookie} from "undici-types";
import {generateToken, generateRefreshToken, verifyToken} from "@/app/(others)/api/auth";

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

        // @ts-ignore
        let query_result =
            await db.select()
                .from(schema.usersTable)
                .where(
                    and(
                        eq(schema.usersTable.login_id, login_id),
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