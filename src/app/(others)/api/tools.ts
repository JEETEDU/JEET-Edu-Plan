import {NextResponse} from "next/server";

export function return_400(message: string): NextResponse {
    return NextResponse.json({
                success: false,
                message: message,
            }, {status: 400});
}

export enum UserType {
    NONE = 0,
    USER = 1,
    TEACHER = 2,
    ADMIN = 3
}