import {NextRequest, NextResponse} from "next/server";

export async function middleware(req: NextRequest) {
    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const url = req.nextUrl.clone();

    const isAsset = url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
    if (isAsset) {
        return NextResponse.next();
    }

    const res = NextResponse.next();
    res.cookies.set("isMobile", isMobile);

    return res;

    // const _url = req.url.split('/');
    // _url.pop();
    // const parentUrl = _url.join("/");
    //
    // if (isMobile) {
    //     if (url.pathname.endsWith('/mobile')) {
    //         return NextResponse.next();
    //     }
    //     return NextResponse.redirect(new URL('/mobile', parentUrl));
    // } else {
    //     if (url.pathname.endsWith('/desktop')) {
    //         return NextResponse.next();
    //     }
    //     return NextResponse.redirect(new URL('/desktop', parentUrl));
    // }

}

export const config = {
    matcher: ['/((?!_next|api|favicon.ico).*)'],
};