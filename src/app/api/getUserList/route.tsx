import {NextResponse} from "next/server";
import {db} from "@/database";
import {usersTable} from "@/database/schema";

/**
 * @swagger
 * /api/getUserList:
 *  get:
 *      summary: 사용자 목록 조회
 *      tags:
 *          - User
 *      responses:
 *          200:
 *              description: 사용자 목록 조회 성공
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  description: API 호출 성공 여부
 *                              users:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *
 */
export async function GET() {
    try {
        const userList = await db.select({
            uid: usersTable.uid,
            login_id: usersTable.login_id,
            user_type: usersTable.user_type,
            name: usersTable.name,
            first_year: usersTable.first_year,
            school: usersTable.school,
            joined_term: usersTable.joined_term,
        }).from(usersTable); // 사용자 테이블에서 모든 사용자 선택
        return NextResponse.json({
            success: true,
            message: userList
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}