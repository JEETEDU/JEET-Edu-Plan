import {NextRequest, NextResponse} from "next/server";
import {usersTable} from "@/database/schema";
import {db} from "@/database";
import crypto from "crypto";
import {DrizzleError} from "drizzle-orm";

/**
 * @swagger
 * /api/insert:
 *  post:
 *      summary: 사용자 추가
 *      tags:
 *          - User
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          name:
 *                              type: string
 *                              description: 사용자 이름
 *                              required: true
 *                              maxLength: 5
 *                          login_id:
 *                              type: string
 *                              description: 로그인 아이디
 *                              required: true
 *                              maxLength: 20
 *                              unique: true
 *                          pw:
 *                              type: string
 *                              description: 비밀번호
 *                              required: true
 *                              minLength: 8
 *      responses:
 *          200:
 *              description: 사용자 추가 성공
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  description: API 호출 성공 여부
 *                              message:
 *                                  type: string
 *                                  description: API 호출 결과 메시지(success가 false일 때만)
 * @param req
 * @constructor
 */
export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        let name = data.get("name");
        let login_id = data.get("login_id");
        let pw = data.get("pw");

        if (!name || !login_id || !pw) {
            return NextResponse.json({
                success: false,
                message: "Please fill all fields",
            });
        }

        name = name.toString().trim();
        login_id = login_id.toString().trim();
        pw = pw.toString().trim();

        if (pw.length < 8) {
            return NextResponse.json({
                success: false,
                message: "Password must be at least 8 characters long",
            });
        }
        if (name.length > 5) {
            return NextResponse.json({
                success: false,
                message: "Name must be less than 5 characters long",
            });
        }
        if (login_id.length > 20) {
            return NextResponse.json({
                success: false,
                message: "Login ID must be less than 20 characters long",
            });
        }

        await db.insert(usersTable).values(
            {
                name: name,
                login_id: login_id,
                pw: crypto.createHash('sha256').update(pw).digest(),
                user_type: 0,
            }
        );

        return NextResponse.json({
            success: true,
            message: "User added successfully"
        });
    } catch (e) {
        console.error(e)
        // TODO: 에러 처리
        if (e instanceof DrizzleError) {
            if (e.code === 'ER_DUP_ENTRY') {
                return NextResponse.json({
                    success: false,
                    message: "User already exists",
                });
            }
        }
        return NextResponse.json({
            success: false,
            message: e.massage,
        });
    }
}