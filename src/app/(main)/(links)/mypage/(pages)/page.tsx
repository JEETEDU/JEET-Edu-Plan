import {cookies} from "next/headers";
import Page from "./_page";

export default async function Login() {
    const cookieStore= await cookies();
    const isMobile = cookieStore.get("isMobile");

    // return (isMobile.value === 'true' ? <Mobile/> : <Desktop/>)
    return <Page isMobile={isMobile.value === "true"}/>
}