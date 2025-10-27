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
import { Button } from '../ui/button'
import { Invoice } from '@/types'
import { Eye } from 'lucide-react'
import { MailModal } from './mail-modal'
import { updateInvoice } from '@/lib/invoices'
const ItemsModal = ({ invoice, onInvoiceUpdate }: { invoice: Invoice; onInvoiceUpdate?: () => void }) => {
    const [open, setOpen] = useState(false);
    const [mailModalOpen, setMailModalOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(invoice.status);

    const handleStatusChange = async (value: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE') => {
        try {
            await updateInvoice(invoice.id, { status: value });
            setCurrentStatus(value); // Update local state to reflect the change
            onInvoiceUpdate?.(); // Refresh the parent component's invoice list
        } catch (error) {
            console.error('Failed to update invoice status:', error);
            // You might want to show a toast notification here
        }
    };

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
                    {currentStatus !== 'SENT' ? (
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 mb-4"
                            onClick={() => setMailModalOpen(true)}
                        >
                            Send Invoice
                        </Button>
                    ) : <div className="mb-4 w-[200px]">
                        <label className="block text-sm font-medium mb-2">
                            Status:
                        </label>
                        <Select
                            value={currentStatus}
                            onValueChange={(value) => {
                                handleStatusChange(value as 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE');
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={currentStatus} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">DRAFT</SelectItem>
                                <SelectItem value="SENT">SENT</SelectItem>
                                <SelectItem value="PAID">PAID</SelectItem>
                                <SelectItem value="OVERDUE">OVERDUE</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    }
                    <MailModal
                        isOpen={mailModalOpen}
                        onClose={() => setMailModalOpen(false)}
                        customerEmail={invoice.customer?.email || ''}
                        invoice={invoice}
                        onStatusUpdate={(newStatus) => {
                            setCurrentStatus(newStatus);
                            onInvoiceUpdate?.(); // Refresh the parent component's invoice list
                        }} />
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
                                        <TableCell>${Number(item.unitPrice).toFixed(2)}</TableCell>
                                        <TableCell>${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
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