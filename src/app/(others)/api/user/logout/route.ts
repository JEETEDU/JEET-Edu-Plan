import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {return_400, return_500, return_not_logged_in} from "@/app/(others)/api/(tools)/tools";

export async function GET(req: NextRequest) {
    return POST(req);
}

/**
 * @swagger
 * /api/user/logout:
 *  post:
 *      tags:
 *          - User/Account
 *      description: Logout
 *      responses:
 *          "200":
 *              description: Logout successful
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: true
 *                              message:
 *                                  type: string
 *                                  example: "Logout successful"
 *              headers:
 *                  Set-Cookie:
 *                      schema:
 *                          type: string
 *          "401":
 *              description: Not logged in
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              success:
 *                                  type: boolean
 *                                  example: false
 *                              message:
 *                                  type: string
 *                                  example: "Not logged in"
 */
export async function POST(req: NextRequest) {
    try {
        const token: string = req.cookies.get("token")?.value ?? '';
        if (token) {
            return NextResponse.json({
                success: true,
                message: "Logout successful"
            }, {status: 200, headers: {"Set-Cookie": "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"}});
        } else {
            return return_not_logged_in();
        }
    } catch (e: any) {
        console.error(e);
        return return_500();
    }
}