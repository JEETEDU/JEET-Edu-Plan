import {sendEmail} from './(tools)/email';
import {NextRequest, NextResponse} from "next/server";
import {return_500} from "@/app/(others)/api/(tools)/tools";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        sendEmail(body);

        return NextResponse.json({
            success: true
        })
    } catch (e) {
        console.error(e);
        return return_500();
    }
}