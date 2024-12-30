import jwt from 'jsonwebtoken';

const secret: string = process.env.JWT_SECRET ?? '';

export function generateToken(user_id: number, user_type: number) {
    return jwt.sign({ user_id: user_id, user_type: user_type }, secret, { expiresIn: '3h' });
}

export function verifyToken(token: string) {
    try {
        let decoded: any = jwt.verify(token, secret);
        return {
            user_id: decoded.userId,
            user_type: decoded.user_type
        }
    } catch (e) {
        return false;
    }
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