import {cookies} from "next/headers";
import Desktop from "@/app/homeworks/(pages)/desktop";
import Mobile from "@/app/homeworks/(pages)/mobile";

export default async function Login() {
    const cookieStore= await cookies();
    const isMobile = cookieStore.get("isMobile");

    return (isMobile.value === 'true' ? <Mobile/> : <Desktop/>)
}