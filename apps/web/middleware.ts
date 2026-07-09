import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
    console.log("MIDDLEWARE RUNNING");

    const token = request.cookies.get("token")?.value;
    const path = request.nextUrl.pathname;

    const isProtected = path.startsWith("/admin") || path.startsWith("/user");
    const isAuthPage = path === "/login" || path === "/signup";

    if (!token && isProtected) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            const role = payload.role as string | undefined;
            const roles = Array.isArray(payload.roles)
                ? (payload.roles as string[])
                : role
                    ? [role]
                    : [];

            console.log("role", roles);

            if (path === "/") {
                if (roles.includes("admin")) {
                    return NextResponse.redirect(new URL("/admin", request.url));
                }

                if (roles.includes("user")) {
                    return NextResponse.redirect(new URL("/user", request.url));
                }
            }

            if (isAuthPage) {
                if (roles.includes("admin")) {
                    return NextResponse.redirect(new URL("/admin", request.url));
                }

                if (roles.includes("user")) {
                    return NextResponse.redirect(new URL("/user", request.url));
                }
            }

            if (path.startsWith("/admin") && !roles.includes("admin")) {
                return NextResponse.redirect(new URL("/unauthorized", request.url));
            }

            if (path.startsWith("/user") && !roles.includes("user")) {
                return NextResponse.redirect(new URL("/unauthorized", request.url));
            }
        } catch (error) {
            console.log("JWT ERROR:", error);

            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("token");

            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};