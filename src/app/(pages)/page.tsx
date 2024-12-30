import {cookies} from "next/headers";
import Desktop from "@/app/(pages)/desktop";
import Mobile from "@/app/(pages)/mobile";

export default async function Login() {
    const cookieStore= await cookies();
    const isMobile = cookieStore.get("isMobile") ?? { value: 'false' };

    return (isMobile?.value === 'true' ? <Mobile/> : <Desktop/>)
}