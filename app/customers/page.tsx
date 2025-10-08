"use client"

import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddCustomerModal, EditCustomerModal, DeleteCustomerModal } from "@/components/customers/form-modal"
import { Customer, CustomerFormData } from '@/types'
import { toast } from "sonner"
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/lib/customers'

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    // Load customers on component mount
    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        try {
            setLoading(true)
            const customerData = await getCustomers()
            setCustomers(customerData)
        } catch (error) {
            console.error("Error loading customers:", error)
            toast.error("Failed to load customers")
        } finally {
            setLoading(false)
        }
    }

    // Handle adding a new customer
    const handleAddCustomer = async (data: CustomerFormData) => {
        try {
            const newCustomer = await addCustomer(data)
            setCustomers(prev => [newCustomer, ...prev])
            toast.success("Customer added successfully!")
        } catch (error) {
            console.error("Error adding customer:", error)
            toast.error("Failed to add customer")
            throw error // Re-throw to keep modal loading state
        }
    }

    // Handle editing a customer
    const handleEditCustomer = async (customerId: string, data: CustomerFormData) => {
        try {
            const updatedCustomer = await updateCustomer(customerId, data)
            setCustomers(prev => prev.map(customer => 
                customer.id === customerId ? updatedCustomer : customer
            ))
            toast.success("Customer updated successfully!")
        } catch (error) {
            console.error("Error updating customer:", error)
            toast.error("Failed to update customer")
            throw error // Re-throw to keep modal loading state
        }
    }

    // Handle deleting a customer
    const handleDeleteCustomer = async (customerId: string) => {
        try {
            await deleteCustomer(customerId)
            setCustomers(prev => prev.filter(customer => customer.id !== customerId))
            toast.success("Customer deleted successfully!")
        } catch (error) {
            console.error("Error deleting customer:", error)
            toast.error("Failed to delete customer")
            throw error // Re-throw to keep modal loading state
        }
    }

    // Filter customers based on search query
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchQuery)) ||
        (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase())) 
    )

    // Format date for display
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-row justify-between items-center p-6 bg-white border-b">
                <div className="flex space-x-1">
                    <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <AddCustomerModal onSubmit={handleAddCustomer} />
                </div>
            </div>
            
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="text-gray-500">Loading customers...</div>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone & Email</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>
                                            {customer.phone && <div>{customer.phone}</div>}
                                            {customer.email && <div className="text-gray-600">{customer.email}</div>}
                                        </TableCell>
                                        <TableCell>{customer.address || '-'}</TableCell>
                                        <TableCell>{formatDate(customer.createdAt)}</TableCell>
                                        <TableCell>{formatDate(customer.updatedAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <EditCustomerModal 
                                                    customer={customer}
                                                    onSubmit={(data) => handleEditCustomer(customer.id, data)}
                                                />
                                                <DeleteCustomerModal
                                                    customer={{ id: customer.id, name: customer.name }}
                                                    onDelete={handleDeleteCustomer}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        {searchQuery ? 'No customers found matching your search.' : 'No customers found.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
