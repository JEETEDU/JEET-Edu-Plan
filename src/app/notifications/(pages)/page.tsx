import {cookies} from "next/headers";
import Desktop from "@/app/notifications/(pages)/desktop";
import Mobile from "@/app/notifications/(pages)/mobile";

export default async function Login() {
    const cookieStore= await cookies();
    const isMobile = cookieStore.get("isMobile");

    return (isMobile.value === 'true' ? <Mobile/> : <Desktop/>)
}