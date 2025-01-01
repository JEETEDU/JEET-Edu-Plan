import jwt from 'jsonwebtoken';
import {UserType} from "@/app/(others)/api/(tools)/tools";

const secret: string = process.env.JWT_SECRET ?? '';

export function generateToken(user_id: number, user_type: number) {
    return jwt.sign({
        user_id: user_id,
        user_type: user_type
    }, secret, { expiresIn: '3h' });
}

export function verifyToken(token: string): DecodedToken | false {
    try {
        let decoded: any = jwt.verify(token, secret);
        if (decoded.user_type == UserType.NONE) return false;
        return {
            user_id: decoded.user_id,
            user_type: decoded.user_type
        }
    } catch (e) {
        return false;
    }
}

export type DecodedToken = {
    user_id: number,
    user_type: number
}

// 귀찮으니 refresh token은 안 쓸거임 ㅇㅇ
// export function generateRefreshToken(userId: number, user_type: number) {
//     return jwt.sign({ userId: userId, user_type: user_type }, secret, { expiresIn: '3d' });
// }
//
// export function verifyRefreshToken(token: string) {
//     try {
//         let decoded: any = jwt.verify(token, secret);
//         return {
//             user_id: decoded.user_id,
//             user_type: decoded.user_type
//         }
//     } catch (e) {
//         return false;
//     }
// }