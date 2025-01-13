import {DecodedToken, verifyToken} from "@/app/(others)/api/(tools)/auth";
import {return_not_logged_in, return_permission_denied, UserType} from "@/app/(others)/api/(tools)/tools";

export function check_admin_permission(token: string) {
    let decoded: DecodedToken | false;
    if (token) {
        decoded = verifyToken(token);
        if (!decoded) {
            return return_not_logged_in();
        }
        if (decoded.user_type < UserType.ADMIN) {
            return return_permission_denied();
        }
    } else {
        return return_not_logged_in();
    }

    return decoded;
}