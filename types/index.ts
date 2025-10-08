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