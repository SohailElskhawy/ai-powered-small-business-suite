import { Invoice } from "@prisma/client";


const API_BASE = '/api/invoices';

export const getInvoices = async (): Promise<Invoice[]> => {
    const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch invoices');
    }
    return response.json();
}