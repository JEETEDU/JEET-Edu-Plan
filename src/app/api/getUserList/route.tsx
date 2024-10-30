import {NextResponse} from "next/server";
import {db} from "@/database";
import {users} from "@/database/schema";

export async function GET() {
    try {
        const userList = await db.select().from(users); // 사용자 테이블에서 모든 사용자 선택
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