import {cookies} from "next/headers";
import Desktop from "@/app/mypage/(pages)/desktop";
import Mobile from "@/app/mypage/(pages)/mobile";

export default async function Login() {
    const cookieStore= await cookies();
    const isMobile = cookieStore.get("isMobile");

    return (isMobile.value === 'true' ? <Mobile/> : <Desktop/>)
}