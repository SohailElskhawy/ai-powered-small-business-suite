'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '../ui/button'
import { Invoice } from '@/types'
import { Eye } from 'lucide-react'
const ItemsModal = ({ invoice }: { invoice: Invoice }) => {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className='mx-0.5'>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Invoice Items - {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>
                        Detailed list of items for this invoice.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        Send Invoice
                    </Button>
                </div>
                <div className="mt-4">
                    {invoice.items && invoice.items.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>${item.unitPrice}</TableCell>
                                        <TableCell>${item.quantity * item.unitPrice}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-gray-500">No items found for this invoice.</div>
                    )}
                </div>
                <div className="mt-4">
                    <strong>Total Amount: </strong> ${invoice.totalAmount}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ItemsModal