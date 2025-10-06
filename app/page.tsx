"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (session) {
      // User is authenticated, redirect to dashboard
      router.push("/dashboard")
    }
    // If no session, stay on this page to show sign-in options
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (session) {
    // This will show briefly before redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Redirecting to dashboard...
          </h1>
        </div>
      </div>
    )
  }

  // Show welcome page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            AI-Powered Small Business Suite
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your business operations with our comprehensive suite of tools for customer management, invoicing, and inventory tracking.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/auth/signup">
              Get Started
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
            <Link href="/auth/signin">
              Sign In
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Customer Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Keep track of all your customers, their contact information, and interaction history in one organized place.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Smart Invoicing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create professional invoices, track payments, and manage your billing cycle with automated reminders.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Inventory Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor your products, stock levels, and pricing with real-time updates and low-stock alerts.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <p className="text-sm text-gray-500">
            Start managing your business more efficiently today
          </p>
        </div>
      </div>
    </div>
  )
}
