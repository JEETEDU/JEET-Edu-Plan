import {NextResponse} from "next/server";
import * as schema from "@/database/schema";

export function return_400(message: string): NextResponse {
    return NextResponse.json({
                success: false,
                message: message,
            }, {status: 400});
}

export function return_not_logged_in(): NextResponse {
    return NextResponse.json({
                success: false,
                message: "Not logged in"
            }, {status: 401});
}

export function return_permission_denied(): NextResponse {
    return NextResponse.json({
                success: false,
                message: "Permission denied"
            }, {status: 403});
}

export function return_500(message: string = "Internal server error"): NextResponse {
    return NextResponse.json({
                success: false,
                message: message
            }, {status: 500});
}

export enum UserType {
    NONE = 0,
    STUDENT = 1,
    TEACHER = 2,
    ADMIN = 3
}

export async function db_log(tx: any, user_id: number, detail: string) {
    // @ts-ignore
    await tx.insert(schema.logs).values(
        {
            user_id: user_id,
            detail: detail,
        });
}