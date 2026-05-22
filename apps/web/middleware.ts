import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {

    console.log("MIDDLEWARE RUNNING");

    const token = request.cookies.get("token")?.value;

    const path = request.nextUrl.pathname;

    console.log("PATH:", path);
    console.log("TOKEN:", token);

    // protected routes
    const isProtected =
        path.startsWith("/admin") ||
        path.startsWith("/author") ||
        path.startsWith("/reader");

    // auth pages
    const isAuthPage =
        path === "/login" ||
        path === "/signup";

    // no token + protected route
    if (!token && isProtected) {

        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }

    // token exists
    if (token) {

        try {

            const secret = new TextEncoder().encode(
                process.env.JWT_SECRET
            );

            const { payload } = await jwtVerify(
                token,
                secret
            );

            const role = payload.role as string;

            console.log("ROLE:", role);

            // =========================
            // HOME PAGE REDIRECT
            // =========================

            if (path === "/") {

                if (role === "admin") {
                    return NextResponse.redirect(
                        new URL("/admin", request.url)
                    );
                }

                if (role === "author") {
                    return NextResponse.redirect(
                        new URL("/author", request.url)
                    );
                }

                if (role === "reader") {
                    return NextResponse.redirect(
                        new URL("/reader", request.url)
                    );
                }
            }

            // =========================
            // BLOCK LOGIN/SIGNUP
            // =========================

            if (isAuthPage) {

                if (role === "admin") {
                    return NextResponse.redirect(
                        new URL("/admin", request.url)
                    );
                }

                if (role === "author") {
                    return NextResponse.redirect(
                        new URL("/author", request.url)
                    );
                }

                if (role === "reader") {
                    return NextResponse.redirect(
                        new URL("/reader", request.url)
                    );
                }
            }

            // =========================
            // ADMIN ACCESS
            // =========================

            if (
                path.startsWith("/admin") &&
                role !== "admin"
            ) {

                return NextResponse.redirect(
                    new URL("/unauthorized", request.url)
                );
            }

            // =========================
            // AUTHOR ACCESS
            // =========================

            if (
                path.startsWith("/author") &&
                role !== "author"
            ) {

                return NextResponse.redirect(
                    new URL("/unauthorized", request.url)
                );
            }

            // =========================
            // READER ACCESS
            // =========================

            if (
                path.startsWith("/reader") &&
                role !== "reader"
            ) {

                return NextResponse.redirect(
                    new URL("/unauthorized", request.url)
                );
            }

        } catch (error) {

            console.log("JWT ERROR:", error);

            const response = NextResponse.redirect(
                new URL("/login", request.url)
            );

            response.cookies.delete("token");

            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/login",
        "/signup",
        "/admin/:path*",
        "/author/:path*",
        "/reader/:path*",
    ],
};