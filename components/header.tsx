"use client"

import React from 'react'
import { AuthButton } from './auth/auth-components'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/constants'

export const Header = () => {
    const { data: session } = useSession()
    const pathname = usePathname()

    // Check if current route should show sidebar
    const shouldShowSidebar = session && ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + "/")
    )

    if (!shouldShowSidebar) {
        return null
    }

    return (
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Business Suite
                        </h1>
                    </div>
                    <AuthButton />
                </div>
            </div>
        </header>
    )
}
