import {cookies} from "next/headers";
import Desktop from "./desktop";
import Mobile from "./mobile";

export default async function Login() {
    const cookieStore= await cookies();
    const isMobile = cookieStore.get("isMobile") ?? { value: 'false' };

    return (isMobile?.value === 'true' ? <Mobile/> : <Desktop/>)
}