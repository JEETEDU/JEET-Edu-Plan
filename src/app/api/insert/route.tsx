import {NextRequest, NextResponse} from "next/server";
import {usersTable} from "@/database/schema";
import {db} from "@/database";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const name = data.get("name");
        const pw = data.get("pw");

        await db.insert(usersTable).values(
            {
                name: name,
                password: pw,
            }
        );

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