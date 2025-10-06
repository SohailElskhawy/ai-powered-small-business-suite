import { withAuth } from "next-auth/middleware"

export default withAuth(
    function middleware(req) {
        // Add any additional middleware logic here
        console.log("Middleware executed for:", req.nextUrl.pathname)
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Protect admin routes
                if (req.nextUrl.pathname.startsWith("/admin")) {
                    return token?.role === "ADMIN"
                }

                // Protect API routes except auth
                if (req.nextUrl.pathname.startsWith("/api/")) {
                    if (req.nextUrl.pathname.startsWith("/api/auth/")) {
                        return true
                    }
                    return !!token
                }

                // Protect dashboard and other authenticated pages
                if (req.nextUrl.pathname.startsWith("/dashboard") ||
                    req.nextUrl.pathname.startsWith("/customers") ||
                    req.nextUrl.pathname.startsWith("/products") ||
                    req.nextUrl.pathname.startsWith("/invoices")) {
                    return !!token
                }

                return true
            },
        },
    }
)

export const config = {
    matcher: [
        // Protect all routes except public ones
        "/((?!_next/static|_next/image|favicon.ico|auth/signin|auth/signup|$).*)",
    ]
}