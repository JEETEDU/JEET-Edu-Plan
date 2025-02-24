import {NextRequest, NextResponse} from "next/server";
import {DecodedToken} from "@/app/(others)/api/(tools)/auth";
import {return_500} from "@/app/(others)/api/(tools)/tools";
import fs from "node:fs";
import {check_admin_permission} from "@/app/(others)/api/admin/(tools)/tools";

/**
 * @swagger
 * /api/admin/banner:
 *   put:
 *     summary: Upload a banner image
 *     description: Upload a banner image to the server.
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The banner image has been uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
export async function PUT(req: NextRequest) {
    try {
        const token: DecodedToken | NextResponse = check_admin_permission(req.cookies.get("token")?.value ?? '');
        if (token instanceof NextResponse) return token;

        const data = await req.formData();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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