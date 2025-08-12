import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicPaths = [
    "/",
];

const authPaths = [
    "/sign-in",
    "/sign-up",
];

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    const { pathname } = new URL(request.url);

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    if (sessionCookie && authPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!sessionCookie && !authPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};