import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// export async function proxy(request: NextRequest) {

//     const token = request.cookies.get("token")?.value;
//     const path = request.nextUrl.pathname;
//     console.log(token, "kkk", path)
//     const isProtected = path.startsWith("/admin") || path.startsWith("/user");
//     const isAuthPage = path === "/login" || path === "/signup";
//     if (path === "/") {
//         return NextResponse.redirect(new URL("/login", request.url));
//     }
    
//     // if (!token && isProtected) {
//     //     return NextResponse.redirect(new URL("/login", request.url));
//     // }

//     // const { data } = await api.get("/auth/me", {
//     //     withCredentials: true,
//     // });
//     // if (token) {
//     //     try {
//     //         const secret = new TextEncoder().encode(process.env.JWT_SECRET);
//     //         const { payload } = await jwtVerify(token, secret);

//     //         const role = payload.role as string | undefined;
//     //         const roles = Array.isArray(payload.roles)
//     //             ? (payload.roles as string[])
//     //             : role
//     //                 ? [role]
//     //                 : [];


//     //         if (path === "/") {
//     //             if (roles.includes("admin")) {
//     //                 return NextResponse.redirect(new URL("/admin", request.url));
//     //             }

//     //             if (roles.includes("user")) {
//     //                 return NextResponse.redirect(new URL("/user", request.url));
//     //             }
//     //             else {
//     //                 return NextResponse.redirect(new URL("/login", request.url));
//     //             }
//     //         }

//     //         if (isAuthPage) {
//     //             if (roles.includes("admin")) {
//     //                 return NextResponse.redirect(new URL("/admin", request.url));
//     //             }

//     //             if (roles.includes("user")) {
//     //                 return NextResponse.redirect(new URL("/user", request.url));
//     //             }
//     //         }

//     //         if (path.startsWith("/admin") && !roles.includes("admin")) {
//     //             return NextResponse.redirect(new URL("/unauthorized", request.url));
//     //         }

//     //         if (path.startsWith("/user") && !roles.includes("user")) {
//     //             return NextResponse.redirect(new URL("/unauthorized", request.url));
//     //         }
//     //     } catch (error) {
//     //         console.error("JWT ERROR:", error);

//     //         const response = NextResponse.redirect(new URL("/login", request.url));
//     //         response.cookies.delete("token");

//     //         return response;
//     //     }
//     // }

//     // return NextResponse.next();
// }
export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    try {
        const response = await fetch(
            "https://blog-app-server-virid.vercel.app/api/auth/me",
            {
                headers: {
                    cookie: request.headers.get("cookie") || "",
                },
            }
        );
console.log(response)
        if (!response.ok) {
            if (path.startsWith("/admin") || path.startsWith("/user")) {
                return NextResponse.redirect(
                    new URL("/login", request.url)
                );
            }

            return NextResponse.next();
        }

        const data = await response.json();

        const roles = data.user.roles || [data.user.role];

        if (path.startsWith("/admin") && !roles.includes("admin")) {
            return NextResponse.redirect(
                new URL("/unauthorized", request.url)
            );
        }

        if (path.startsWith("/user") && !roles.includes("user")) {
            return NextResponse.redirect(
                new URL("/unauthorized", request.url)
            );
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }
}
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};