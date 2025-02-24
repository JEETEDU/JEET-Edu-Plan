import {NextRequest} from "next/server";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {return_not_logged_in} from "@/app/(others)/api/(tools)/tools";
import fs from "node:fs";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value ?? '';
    const decoded: DecodedToken | false = verifyToken(token);
    if (!decoded) return return_not_logged_in();

    return new Response(fs.readFileSync('uploads/banner/banner.png'), {
        headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `inline; filename=${encodeURIComponent('banner.png')}`,
        }
    });
}