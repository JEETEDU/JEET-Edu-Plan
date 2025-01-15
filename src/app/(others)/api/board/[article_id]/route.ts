import type { NextRequest } from 'next/server';
import { db } from '@/database';
import * as schema from '@/database/schema';
import { NextResponse } from 'next/server';
import {and, asc, count, desc, eq, like, sql} from 'drizzle-orm';
import {
    check_date_string,
    return_400,
    return_500,
    return_not_logged_in,
    return_permission_denied,
    UserType
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {QueryBuilder} from "drizzle-orm/mysql-core";
import {save_files} from "@/app/(others)/api/(tools)/files";

// export async function GET(req: NextRequest, { params }: { params: { article_id: string } }) {
//     try {
//         const token = req.cookies.get("token")?.value ?? '';
//         let decoded: DecodedToken | false = verifyToken(token);
//         if (!decoded) return return_not_logged_in();
//
//         const article_id = (await params).article_id;
//
//         let article =
//             await db.select()
//                 .from(schema.boards)
//                 .leftJoin(
//                     schema.users,
//                     eq(schema.boards.author, schema.users.uid)
//                 )
//     } catch (e) {
//         console.error(e);
//         return return_500();
//     }
}