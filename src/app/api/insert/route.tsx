import {NextRequest, NextResponse} from "next/server";
import {users} from "@/database/schema";
import {db} from "@/database";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { name, pw } = data;

        console.log("Received data:", data);

        await db.insert(users).values({
            name: name,
            password: pw,
        });

        return NextResponse.json({
            success: true,
            message: "User added successfully"
        });
    } catch (e: Error) {
        console.log(e)
        return NextResponse.json({
            success: false,
            message: e.massage,
        });
    }
}