'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Trash2, Package, FileText, Edit } from 'lucide-react'
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Customer, Product, InvoiceFormData, InvoiceItemFormData, Invoice } from '@/types'
import { getCustomers } from '@/lib/customers'
import { getProducts } from '@/lib/products'
import { updateInvoice } from '@/lib/invoices'

const EditInvoiceModal = ({ invoice }: { invoice: Invoice }) => {
    const [open, setOpen] = useState(false)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
    const [dueDate, setDueDate] = useState<string>('')
    const [items, setItems] = useState<InvoiceItemFormData[]>([])
    const [loading, setLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)
    const router = useRouter()

    // Initialize form data from invoice prop
    useEffect(() => {
        setSelectedCustomerId(invoice.customerId)
        
        // Handle different date formats
        let formattedDueDate = ''
        if (invoice.dueDate) {
            try {
                // If it's already a Date object
                if (invoice.dueDate instanceof Date) {
                    formattedDueDate = invoice.dueDate.toISOString().split('T')[0]
                } else {
                    // If it's a string, try to parse it
                    const date = new Date(invoice.dueDate)
                    if (!isNaN(date.getTime())) {
                        formattedDueDate = date.toISOString().split('T')[0]
                    }
                }
            } catch (error) {
                console.error('Error parsing due date:', error)
                // Fallback to current date
                formattedDueDate = new Date().toISOString().split('T')[0]
            }
        }
        setDueDate(formattedDueDate)
        
        const initialItems = invoice.items.map(item => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            lineTotal: Number(item.lineTotal)
        }))
        setItems(initialItems)
    }, [invoice])

    // Load customers and products only when modal is opened
    useEffect(() => {
        if (!open) return

        const loadData = async () => {
            setDataLoading(true)
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
            } finally {
                setDataLoading(false)
            }
        }
        loadData()
    }, [open])

    // Memoized callbacks for better performance
    const addItem = useCallback(() => {
        setItems(prev => [...prev, {
            productId: null,
            description: '',
            quantity: 1,
            unitPrice: 0,
            lineTotal: 0
        }])
    }, [])

    const removeItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index))
    }, [])

    const updateItem = useCallback((index: number, field: keyof InvoiceItemFormData, value: string | number | null) => {
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
    }, [products])

    // Memoized total calculation
    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + item.lineTotal, 0)
    }, [items])

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
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

            await updateInvoice(invoice.id, invoiceData)
            toast.success("Invoice updated successfully!")
            setOpen(false)
            router.push('/invoices')
        } catch (error) {
            console.error("Error updating invoice:", error)
            toast.error("Failed to update invoice")
        } finally {
            setLoading(false)
        }
    }, [selectedCustomerId, dueDate, items, invoice.id, router])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className='mx-0.5'>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] md:max-w-[850px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl">
                        Edit Invoice
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* Customer and Due Date Section */}
                    <Card className="p-4 md:p-6">
                        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Invoice Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Customer *
                                </label>
                                <Select 
                                    value={selectedCustomerId} 
                                    onValueChange={setSelectedCustomerId}
                                    disabled={dataLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={dataLoading ? "Loading customers..." : "Select a customer"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Due Date *
                                </label>
                                <div className="relative">
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
                    <Card className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                            <h2 className="text-base md:text-lg font-semibold">Invoice Items</h2>
                            <Button
                                type="button"
                                onClick={addItem}
                                variant="outline"
                                size="sm"
                                disabled={dataLoading}
                                className="self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm md:text-base">No items added yet. Click &quot;Add Item&quot; to get started.</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile View - Cards */}
                                <div className="block md:hidden space-y-4">
                                    {items.map((item, index) => (
                                        <Card key={index} className="p-4 border-2">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-sm font-medium text-gray-600">Item #{index + 1}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium mb-1 text-gray-600">Product</label>
                                                    <Select
                                                        value={item.productId || 'custom'}
                                                        onValueChange={(value) => updateItem(index, 'productId', value === 'custom' ? null : value)}
                                                        disabled={dataLoading}
                                                    >
                                                        <SelectTrigger className="text-sm">
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
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-medium mb-1 text-gray-600">Description</label>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        className="text-sm"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 text-gray-600">Qty</label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 text-gray-600">Unit Price</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            placeholder="0.00"
                                                            className="text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium mb-1 text-gray-600">Total</label>
                                                        <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center text-sm font-medium">
                                                            ${item.lineTotal.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Desktop View - Table */}
                                <div className="hidden md:block overflow-x-auto">
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
                                                            disabled={dataLoading}
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
                            </>
                        )}

                        {/* Total Section */}
                        {items.length > 0 && (
                            <div className="mt-4 md:mt-6 border-t pt-4">
                                <div className="flex justify-end">
                                    <div className="w-full md:w-64">
                                        <div className="flex justify-between items-center text-lg font-semibold bg-gray-50 p-3 rounded-md">
                                            <span>Total:</span>
                                            <span>${totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                            className="order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || items.length === 0}
                            className="order-1 sm:order-2"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditInvoiceModal