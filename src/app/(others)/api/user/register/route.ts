import type { NextRequest } from 'next/server'
import { db } from '@/database'
import * as schema from '@/database/schema'
import crypto from 'crypto'
import {NextResponse} from "next/server";
import {eq} from "drizzle-orm";
import {generateToken} from "@/app/(others)/api/auth";
import {return_400} from "@/app/(others)/api/tools";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        let name = data.get("name");
        let login_id = data.get("login_id");
        let pw = data.get("pw");

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

        let user = await db.transaction(async (tx) => {
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

            return user;
        });

        let new_token = generateToken(user.uid, user.user_type);
        let res = NextResponse.json({
            success: true,
            message: "Login successful"
        })
        res.cookies.set("token", new_token, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 60 * 60,
            secure: true
        });
        return res;
    } catch (e: any) {
        if (e.code == 'ER_DUP_ENTRY') {
            return return_400("User id already exists");
        }
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, {status: 500});
    }
}