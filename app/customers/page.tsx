"use client"

import React, { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function CustomersPage() {
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my')
    const [searchQuery, setSearchQuery] = useState('')

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
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Customer
                    </Button>
                </div>
            </div>
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
                    <TableRow>
                        <TableCell className="font-medium">John Doe</TableCell>
                        <TableCell>(123) 456-7890<br />johndoe@example.com</TableCell>
                        <TableCell>123 Main St, City, State</TableCell>
                        <TableCell>2023-10-01</TableCell>
                        <TableCell>2022-05-15</TableCell>
                        <TableCell>
                            <button className="text-blue-600 hover:underline">View</button>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">Jane Smith</TableCell>
                        <TableCell>(987) 654-3210<br />janesmith@example.com</TableCell>
                        <TableCell>456 Elm St, City, State</TableCell>
                        <TableCell>2023-09-20</TableCell>
                        <TableCell>2021-11-30</TableCell>
                        <TableCell>
                            <button className="text-blue-600 hover:underline">View</button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}
