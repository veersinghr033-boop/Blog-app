import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {

    console.log("MIDDLEWARE RUNNING");

    const token = request.cookies.get("token")?.value;
    console.log(token)

    const path = request.nextUrl.pathname;

    console.log("PATH:", request.nextUrl.pathname);
console.log("TOKEN:", request.cookies.get("token")?.value);
console.log("SECRET:", process.env.JWT_SECRET);

    const isProtected =
        path.startsWith("/admin") ||
        path.startsWith("/reader");

    const isAuthPage =
        path === "/login" ||
        path === "/signup";

    if (!token && isProtected) {

        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }

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

            // console.log("ROLE:", role);



            if (path === "/") {

                if (role === "admin") {
                    return NextResponse.redirect(
                        new URL("/admin", request.url)
                    );
                }

                if (role === "reader") {
                    return NextResponse.redirect(
                        new URL("/reader", request.url)
                    );
                }
            }


            if (isAuthPage) {

                if (role === "admin") {
                    return NextResponse.redirect(
                        new URL("/admin", request.url)
                    );
                }

               
                if (role === "reader") {
                    return NextResponse.redirect(
                        new URL("/reader", request.url)
                    );
                }
            }

            if (
                path.startsWith("/admin") &&
                role !== "admin"
            ) {

                return NextResponse.redirect(
                    new URL("/unauthorized", request.url)
                );
            }
            
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
        "/reader/:path*",
    ],
};