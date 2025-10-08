"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AddCustomerModal } from "@/components/customers/form-modal"
import { addCustomer } from "@/lib/customers"
import { toast } from "sonner"
import { CustomerFormData } from "@/types"

export default function Dashboard() {
    const { data: session } = useSession()

    const handleAddCustomer = async (data: CustomerFormData) => {
        try {
            await addCustomer(data)
            toast.success("Customer added successfully!")
        } catch (error) {
            console.error("Error adding customer:", error)
            toast.error("Failed to add customer")
            throw error // Re-throw to keep modal loading state
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Welcome back, {session?.user?.name || session?.user?.email || "User"}!
                        </h2>
                        <p className="mt-1 text-gray-600">
                            Here&apos;s what&apos;s happening with your business today.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium text-gray-900">
                                    Total Customers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">0</div>
                                <p className="text-xs text-gray-600">No customers yet</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium text-gray-900">
                                    Active Invoices
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">0</div>
                                <p className="text-xs text-gray-600">No invoices yet</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium text-gray-900">
                                    Products
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">0</div>
                                <p className="text-xs text-gray-600">No products yet</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium text-gray-900">
                                    Revenue (Month)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">$0</div>
                                <p className="text-xs text-gray-600">No revenue yet</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <AddCustomerModal mode="add_quick_action" onSubmit={handleAddCustomer} />
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/products/new">
                                        Add New Product
                                    </Link>
                                </Button>
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/invoices/new">
                                        Create Invoice
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center text-gray-500 py-8">
                                    <p>No recent activity to show.</p>
                                    <p className="text-sm mt-2">
                                        Start by adding customers and creating invoices.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}