import {cookies} from "next/headers";
import Desktop from "@/app/timeTable/(pages)/desktop";
import Mobile from "@/app/timeTable/(pages)/mobile";

export default async function Login() {
    const cookieStore= await cookies();
    const isMobile = cookieStore.get("isMobile");

    return (isMobile.value === 'true' ? <Mobile/> : <Desktop/>)
}