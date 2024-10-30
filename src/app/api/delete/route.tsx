import {NextRequest, NextResponse} from "next/server";
import {users} from "@/database/schema";
import {db} from "@/database";
import {eq} from "drizzle-orm/sql/expressions/conditions";

export async function POST(req: NextRequest) {
    try {
        const id = await req.json();

        console.log("Received data:", id);

        await db.delete(users).where(eq(users.id, id));

        return NextResponse.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (e: Error) {
        console.log(e)
        return NextResponse.json({
            success: false,
            message: e.massage,
        });
    }
}