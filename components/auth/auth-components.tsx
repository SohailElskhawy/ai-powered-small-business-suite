"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

export function AuthButton() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
        )
    }

    if (session) {
        return (
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                    Welcome, {session.user?.name || session.user?.email}
                </span>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                >
                    Sign out
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center space-x-2">
            <Link
                href="/auth/signin"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
            >
                Sign in
            </Link>
            <Link
                href="/auth/signup"
                className="text-sm border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-md transition-colors"
            >
                Sign up
            </Link>
        </div>
    )
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Authentication Required
                    </h1>
                    <p className="text-gray-600 mb-6">
                        You need to be signed in to access this page.
                    </p>
                    <Link
                        href="/auth/signin"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        )
    }

    return <>{children}</>
}