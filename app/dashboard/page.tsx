"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AddCustomerModal } from "@/components/customers/form-modal"
import { addCustomer } from "@/lib/customers"
import { toast } from "sonner"
import { CustomerFormData } from "@/types"
import useDashboardData from "@/hooks/useDashboardData"
import { ChartLine } from "@/components/dashboard/line-chart"


export default function Dashboard() {
    const { data: session } = useSession()
    const {customerCount, invoicesData, productsCount, revenueMonth, monthlyRevenueData} = useDashboardData()

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
                                <div className="text-2xl font-bold text-gray-900">{customerCount || 0}</div>
                                {
                                    customerCount ? (
                                        <p className="text-xs text-gray-600">Actively engaging with your business.</p>
                                    ) : (
                                        <p className="text-xs text-gray-600">No customers yet</p>
                                    )
                                }
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium text-gray-900">
                                    Active Invoices
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{invoicesData.length}</div>
                                {
                                    invoicesData.length ? (
                                        <p className="text-xs text-gray-600">Invoices awaiting payment.</p>
                                    ) : (
                                        <p className="text-xs text-gray-600">No active invoices</p>
                                    )
                                }
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium text-gray-900">
                                    Products
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{productsCount || 0}</div>
                                {
                                    productsCount ? (
                                        <p className="text-xs text-gray-600">Products available for sale.</p>
                                    ) : (
                                        <p className="text-xs text-gray-600">No products yet</p>
                                    )
                                }
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium text-gray-900">
                                    Revenue (Month)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">${Number(revenueMonth).toFixed(2)}</div>
                                {
                                    revenueMonth ? (
                                        <p className="text-xs text-gray-600">Revenue generated this month.</p>
                                    ) : (
                                        <p className="text-xs text-gray-600">No revenue yet</p>
                                    )
                                }
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

                        {/* chart */}
                        <ChartLine data={monthlyRevenueData} />
                    </div>
                </div>
            </main>
        </div>
    )
}