'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Invoice } from "@/types"
import { useState } from "react"
import { updateInvoice } from "@/lib/invoices"

interface MailModalProps {
    isOpen: boolean
    onClose: () => void
    customerEmail: string
    invoice: Invoice
    onStatusUpdate?: (newStatus: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE') => void
}

interface EmailContent {
    subject: string;
    text: string;
}

export const MailModal = ({ isOpen, onClose, customerEmail, invoice, onStatusUpdate }: MailModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [subject, setSubject] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const handleGenerateEmail = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer: invoice.customer,
                    invoice: invoice,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate email');
            }

            const content = await response.json();
            const emailContent: EmailContent = content;
            setSubject(emailContent.subject);
            setMessage(emailContent.text);
        } catch (error) {
            console.error("Error generating email:", error);
            alert("Failed to generate email. Please check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if(!subject || !message) {
            alert("Please generate the email content before sending.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    toEmail: customerEmail,
                    subject: subject,
                    textContent: message
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send email');
            }

            const result = await response.json();
            console.log('Email sent successfully:', result);

            // update invoice status and close modal
            await updateInvoice(invoice.id, { status: 'SENT' });
            onStatusUpdate?.('SENT'); // Update the parent component's state
            alert('Email sent successfully!');
            onClose();
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to send email. Please check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Send Invoice Email</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to send the invoice to the customer.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center items-center gap-4">
                    <Button
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                        onClick={async () => {
                            await handleGenerateEmail();
                        }}
                    >
                        {loading ? 'Generating...' : 'Generate Email Content'}
                    </Button>
                </div>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="toEmail" className="text-sm font-medium">To Email</label>
                        <Input id="toEmail" type="email" defaultValue={customerEmail} />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                        <Input id="subject" type="text" placeholder={`Invoice ${invoice.invoiceNumber} from Your Company`}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="message" className="text-sm font-medium">Text Content</label>
                        <Textarea id="message" rows={6} placeholder="Dear Customer, Please find attached your invoice..."
                            className="max-h-[250px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSendEmail} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Email'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}