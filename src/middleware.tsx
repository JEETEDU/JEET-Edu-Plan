import {NextRequest, NextResponse} from "next/server";

export async function middleware(req: NextRequest) {
    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const url = req.nextUrl.clone();
    // const userInfo = await getStoreData('/api/user/info', 'user-info');

    const isAsset = url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
    if (isAsset) {
        return NextResponse.next();
    }

    const {cookies} = req;
    cookies.set("isMobile", isMobile);
    const hasToken = cookies.has('token');

    // const res = NextResponse.next();
    // res.cookies.set("isMobile", isMobile);

    // return res;

    let res = NextResponse.next();

    if (hasToken && req.nextUrl.pathname === '/') {
        res = NextResponse.redirect(new URL('/home', req.nextUrl.origin));
    } else if (!hasToken && req.nextUrl.pathname !== '/') {
        res = NextResponse.redirect(new URL('/', req.nextUrl.origin));
    }

    // console.log(res);

    res.cookies.set("isMobile", isMobile);

    return res;
}

export const config = {
    matcher: ['/((?!_next|api|favicon.ico).*)'],
};