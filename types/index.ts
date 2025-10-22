export interface Customer {
    id: string
    userId: string
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    notes?: string | null
    createdAt: Date
    updatedAt: Date
}

// For form submissions (without Prisma-specific fields)
export interface CustomerFormData {
    name: string
    email?: string
    phone?: string
    address?: string
    notes?: string
}



export interface Invoice {
    id: string
    userId: string
    customerId: string
    invoiceNumber: string
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
    dueDate: Date
    totalAmount: number
    items: InvoiceItem[]
    createdAt: Date
    updatedAt: Date
}

export interface InvoiceItem {
    id: string
    invoiceId: string
    productId: string
    description: string
    quantity: number
    unitPrice: number
    lineTotal: number
    createdAt: Date
    updatedAt: Date
}


export interface ProductFormData {
    name: string
    sku: string
    description?: string
    unitPrice: number
    stockQuantity: number
}

export interface Product {
    id: string
    userId: string
    name: string
    sku: string | null
    description: string | null
    unitPrice: number
    stockQuantity: number
    createdAt: Date
    updatedAt: Date
}

export interface InvoiceFormData {
    customerId: string
    items: InvoiceItemFormData[]
    dueDate: string // ISO date string
}

export interface InvoiceItemFormData {
    productId?: string | null
    description: string
    quantity: number
    unitPrice: number
    lineTotal: number
}