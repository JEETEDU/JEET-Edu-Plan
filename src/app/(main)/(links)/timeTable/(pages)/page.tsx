import {cookies} from "next/headers";
import Desktop from "./desktop";
import Mobile from "./mobile";

export default async function Login() {
    const cookieStore= await cookies();
    const isMobile = cookieStore.get("isMobile");

    // return (isMobile.value === 'true' ? <Mobile/> : <Desktop/>)
    return (
        <div className="flex w-full h-full items-center bg-gray-100 justify-center text-2xl font-bold">
            개발중입니다.
        </div>
    );
}