"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { ROUTES } from "@/constants"

import React from "react"

interface ConditionalSidebarWrapperProps {
    children: React.ReactNode
}



export function ConditionalSidebarWrapper({ children }: ConditionalSidebarWrapperProps) {
    const { data: session } = useSession()
    const pathname = usePathname()

    // Check if current route should show sidebar
    const shouldShowSidebar = session && ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + "/")
    )

    if (shouldShowSidebar) {
        return (
            <div className="flex flex-1">
                <div className="w-64 bg-white border-r flex-shrink-0 flex flex-col">
                    <AppSidebar />
                </div>
                <div className="flex-1 flex flex-col">
                    <main className="flex-1 p-4 bg-gray-50 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        )
    }

    // Return children without sidebar for other pages or when not authenticated
    return <div className="flex-1">{children}</div>
}