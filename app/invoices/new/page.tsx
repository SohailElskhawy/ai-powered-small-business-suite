"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Trash2, Package, FileText } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Customer, Product, InvoiceFormData, InvoiceItemFormData, CustomerFormData } from '@/types'
import { getCustomers, addCustomer } from '@/lib/customers'
import { getProducts } from '@/lib/products'
import { createInvoice } from '@/lib/invoices'
import { AddCustomerModal } from '@/components/customers/form-modal'

export default function NewInvoicePage() {
    const router = useRouter()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
    const [dueDate, setDueDate] = useState<string>('')
    const [items, setItems] = useState<InvoiceItemFormData[]>([])
    const [loading, setLoading] = useState(false)

    // Load customers and products on component mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [customersData, productsData] = await Promise.all([
                getCustomers(),
                getProducts()
            ])
            setCustomers(customersData)
            // Convert Decimal to number for products
            const convertedProducts = productsData.map(product => ({
                ...product,
                unitPrice: Number(product.unitPrice)
            }))
            setProducts(convertedProducts)
        } catch (error) {
            console.error("Error loading data:", error)
            toast.error("Failed to load data")
        }
    }

    // Handle adding a new customer
    const handleAddCustomer = async (data: CustomerFormData) => {
        try {
            const newCustomer = await addCustomer(data)
            setCustomers(prev => [newCustomer, ...prev])
            setSelectedCustomerId(newCustomer.id)
            toast.success("Customer added successfully!")
        } catch (error) {
            console.error("Error adding customer:", error)
            toast.error("Failed to add customer")
            throw error
        }
    }

    // Add a new item row
    const addItem = () => {
        setItems(prev => [...prev, {
            productId: null,
            description: '',
            quantity: 1,
            unitPrice: 0,
            lineTotal: 0
        }])
    }

    // Remove an item
    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }

    // Update item field
    const updateItem = (index: number, field: keyof InvoiceItemFormData, value: string | number | null) => {
        setItems(prev => prev.map((item, i) => {
            if (i !== index) return item
            
            const updatedItem = { ...item, [field]: value }
            
            // If product is selected, auto-fill description and unit price
            if (field === 'productId' && value && value !== 'custom') {
                const product = products.find(p => p.id === value)
                if (product) {
                    updatedItem.description = product.name
                    updatedItem.unitPrice = Number(product.unitPrice)
                }
            }
            
            // If custom item is selected, clear the product reference
            if (field === 'productId' && value === 'custom') {
                updatedItem.productId = null
            }
            
            // Always recalculate line total after any update to ensure it's current
            updatedItem.lineTotal = updatedItem.quantity * updatedItem.unitPrice
            
            return updatedItem
        }))
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0)

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!selectedCustomerId) {
            toast.error("Please select a customer")
            return
        }
        
        if (!dueDate) {
            toast.error("Please select a due date")
            return
        }
        
        if (items.length === 0) {
            toast.error("Please add at least one item")
            return
        }
        
        const invalidItems = items.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)
        if (invalidItems) {
            toast.error("Please fill in all item details correctly")
            return
        }

        setLoading(true)
        try {
            const invoiceData: InvoiceFormData = {
                customerId: selectedCustomerId,
                dueDate,
                items
            }
            
            await createInvoice(invoiceData)
            toast.success("Invoice created successfully!")
            router.push('/invoices')
        } catch (error) {
            console.error("Error creating invoice:", error)
            toast.error("Failed to create invoice")
        } finally {
            setLoading(false)
        }
    }

    // Set default due date to 30 days from now
    useEffect(() => {
        const defaultDueDate = new Date()
        defaultDueDate.setDate(defaultDueDate.getDate() + 30)
        setDueDate(defaultDueDate.toISOString().split('T')[0])
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-row justify-between items-center p-6 bg-white border-b">
                <div className="flex space-x-1">
                    <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/invoices')}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? 'Creating...' : 'Create Invoice'}
                    </Button>
                </div>
            </div>
            
            <div className="p-6 max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer and Due Date Section */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Customer *
                                </label>
                                <div className="flex space-x-2">
                                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select a customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className='w-[200px]'>
                                        <AddCustomerModal
                                            onSubmit={handleAddCustomer}
                                            mode="add_quick_action"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Due Date *
                                </label>
                                <div className="relative w-[250px]">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Invoice Items Section */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Invoice Items</h2>
                            <Button
                                type="button"
                                onClick={addItem}
                                variant="outline"
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                        
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No items added yet. Click &quot;Add Item&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-48">Product</TableHead>
                                            <TableHead className="w-64">Description</TableHead>
                                            <TableHead className="w-24">Qty</TableHead>
                                            <TableHead className="w-32">Unit Price</TableHead>
                                            <TableHead className="w-32">Line Total</TableHead>
                                            <TableHead className="w-16">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Select
                                                        value={item.productId || 'custom'}
                                                        onValueChange={(value) => updateItem(index, 'productId', value === 'custom' ? null : value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select product" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="custom">
                                                                <div className="flex items-center">
                                                                    <FileText className="w-4 h-4 mr-2" />
                                                                    Custom Item
                                                                </div>
                                                            </SelectItem>
                                                            {products.map((product) => (
                                                                <SelectItem key={product.id} value={product.id}>
                                                                    <div className="flex items-center">
                                                                        <Package className="w-4 h-4 mr-2" />
                                                                        {product.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        required
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        required
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    ${item.lineTotal.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        
                        {/* Total Section */}
                        {items.length > 0 && (
                            <div className="mt-6 border-t pt-4">
                                <div className="flex justify-end">
                                    <div className="w-64">
                                        <div className="flex justify-between items-center text-lg font-semibold">
                                            <span>Total:</span>
                                            <span>${totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </form>
            </div>
        </div>
    )
}   