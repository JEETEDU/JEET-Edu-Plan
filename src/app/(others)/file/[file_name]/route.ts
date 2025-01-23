import {NextRequest, NextResponse} from 'next/server';
import {
    return_404, return_not_logged_in
} from "@/app/(others)/api/(tools)/tools";
import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import * as fs from "node:fs";
import { db } from '@/database';
import * as schema from '@/database/schema';
import {eq} from "drizzle-orm";

/**
 * @swagger
 * /api/{file_name}:
 *   get:
 *     summary: Download a file by its name
 *     description: Returns the contents of a file from the server as an attachment.
 *     tags:
 *       - Files
 *     parameters:
 *       - in: path
 *         name: file_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the file to retrieve.
 *     responses:
 *       200:
 *         description: The file has been retrieved successfully.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: File not found or invalid request.
 *       401:
 *         description: Unauthorized. User is not logged in or token is invalid.
 *       404:
 *         description: File not found.
 */
export async function GET(req: NextRequest, { params }: { params: { file_name: string } }) {
    const token = req.cookies.get("token")?.value ?? '';
    const decoded: DecodedToken | false = verifyToken(token);
    if (!decoded) return return_not_logged_in();

    let file_id = (await params).file_name;

    const file_path = 'uploads/files/' + file_id;
    const file_ext = file_id.split('.').pop();
    file_id = file_id.split('.').shift() ?? '';
    if (!fs.existsSync(file_path)) return return_404("file not found");
    console.log(file_id);
    const [file_name] =
        await db.select()
            .from(schema.file)
            .where(eq(schema.file.id, file_id));

    if(!file_name) return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });

    let content_type = 'application/octet-stream';
    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
        content_type = 'image/' + file_ext;
    }
    else if (file_ext == 'pdf') {
        content_type = 'application/pdf';
    }
    return new Response(fs.readFileSync(file_path), {
        headers: {
            'Content-Type': content_type,
            'Content-Disposition': `attachment; filename=${encodeURIComponent(file_name.name)}`
        }
    });
}