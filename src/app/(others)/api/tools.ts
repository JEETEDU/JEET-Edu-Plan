import {NextResponse} from "next/server";

export function return_400(message: string): NextResponse {
    return NextResponse.json({
                success: false,
                message: message,
            }, {status: 400});
}