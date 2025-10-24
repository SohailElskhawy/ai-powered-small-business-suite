"use client"

import React, { useState, useEffect } from 'react'
import {  PrinterIcon, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { getInvoices } from '@/lib/invoices'

import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Invoice } from '@/types'
import Link from 'next/link'
import ReactPDF from '@react-pdf/renderer';
import InvoicePDF from '@/components/invoices/invoice-document'
import ItemsModal from '@/components/invoices/items-modal'
import EditInvoiceModal from '@/components/invoices/form-modal'
export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices()
    }, [])

    const loadInvoices = async () => {
        try {
            setLoading(true)
            const invoiceData = await getInvoices()
            setInvoices(invoiceData)
        } catch (error) {
            console.error("Error loading invoices:", error)
            toast.error("Failed to load invoices")
        } finally {
            setLoading(false)
        }
    }

    const filteredInvoices = invoices.filter((invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const generatePDF = async (invoice: Invoice) => {
        const doc = <InvoicePDF invoice={invoice} />;
        const asPdf = await ReactPDF.pdf(doc).toBlob();

        const sanitize = (s = "") => s.replace(/[^a-z0-9_.-]/gi, "_");
        const baseName = invoice.invoiceNumber || "invoice";
        const customerPart = invoice.customer?.name ? `-${sanitize(invoice.customer.name)}` : "";
        const filename = `${sanitize(baseName)}${customerPart}.pdf`;

        const blobUrl = URL.createObjectURL(asPdf);

        // Open PDF in a new tab
        window.open(blobUrl, "_blank", "noopener,noreferrer");

        // Also trigger a download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Revoke after a delay to give the new tab time to load the blob
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-row justify-between items-center p-6 bg-white border-b">
                <div className="flex space-x-1">
                    <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
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
                        <Link href="/invoices/new">
                            Create Invoice
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="text-gray-500">Loading Invoices...</div>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice Number</TableHead>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Customer Contact</TableHead>
                                <TableHead>Customer Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Updated At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{invoice.invoiceNumber}</TableCell>
                                        <TableCell>{invoice.customer?.name}</TableCell>
                                        <TableCell>
                                            {invoice.customer?.phone && <div>{invoice.customer.phone}</div>}
                                            {invoice.customer?.email && <div className="text-gray-600">{invoice.customer.email}</div>}
                                        </TableCell>
                                        <TableCell>{invoice.customer?.address}</TableCell>
                                        <TableCell>{invoice.status}</TableCell>
                                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                        <TableCell>${invoice.totalAmount}</TableCell>
                                        <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                                        <TableCell>{formatDate(invoice.updatedAt)}</TableCell>
                                        <TableCell>
                                            <ItemsModal invoice={invoice} />
                                            <EditInvoiceModal invoice={invoice} />
                                            <Button variant="outline" className='mx-0.5' size="sm" onClick={() => generatePDF(invoice)}>
                                                <PrinterIcon className="w-4 h-4 mr-2" />
                                                Print
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        {searchQuery ? 'No invoices found matching your search.' : 'No invoices found.'}
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
