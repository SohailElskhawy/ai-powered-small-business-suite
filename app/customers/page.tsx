"use client"

import React, { useState } from 'react'
import { Search} from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddCustomerModal, EditCustomerModal } from "@/components/customers/form-modal"
import { Customer } from '@/types'
import { sampleCustomers } from '@/constants/dummyData'



export default function CustomersPage() {
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my')
    const [searchQuery, setSearchQuery] = useState('')
    const [customers, setCustomers] = useState<Customer[]>(sampleCustomers)

    // Handle adding a new customer
    const handleAddCustomer = async (data: Omit<Customer, 'id' | 'lastActivity' | 'clientSince'>) => {
        const newCustomer: Customer = {
            id: Date.now().toString(),
            ...data,
            lastActivity: new Date().toISOString().split('T')[0],
            clientSince: new Date().toISOString().split('T')[0],
        }
        setCustomers(prev => [...prev, newCustomer])
        console.log("Adding customer:", newCustomer)
        // add logic to save to backend/database here
    }

    // Handle editing a customer
    const handleEditCustomer = async (customerId: string, data: Omit<Customer, 'id' | 'lastActivity' | 'clientSince'>) => {
        setCustomers(prev => prev.map(customer => 
            customer.id === customerId 
                ? { ...customer, ...data }
                : customer
        ))
        console.log("Editing customer:", data)
        // add logic to update backend/database here
    }

    // Filter customers based on search query
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-row justify-between items-center p-6 bg-white border-b">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === 'my'
                                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        My Customers
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === 'all'
                                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        All Customers
                    </button>
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone & Email</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Last Activity</TableHead>
                            <TableHead>Client Since</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>
                                        {customer.phone}<br />
                                        <span className="text-gray-600">{customer.email}</span>
                                    </TableCell>
                                    <TableCell>{customer.address}</TableCell>
                                    <TableCell>{customer.lastActivity}</TableCell>
                                    <TableCell>{customer.clientSince}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <EditCustomerModal 
                                                customer={customer}
                                                onSubmit={(data) => handleEditCustomer(customer.id, data)}
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
            </div>
        </div>
    )
}
