import {NextRequest, NextResponse} from "next/server";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {return_500, return_not_logged_in} from "@/app/(others)/api/(tools)/tools";
import fs from "node:fs";

export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value ?? '';
        const decoded: DecodedToken | false = verifyToken(token);
        if (!decoded) return return_not_logged_in();

        const data = await req.formData();
        // const article = data.get("article");
        // @ts-ignore
        const file = data.get("file") as File;
        const file_path = 'uploads/banner/banner.png';

        file.arrayBuffer().then((buffer) => {
            fs.writeFileSync(file_path, Buffer.from(buffer));
        });

        return NextResponse.json({
            success: true,
        });
    } catch (e) {
        console.error(e);
        return return_500();
    }
}