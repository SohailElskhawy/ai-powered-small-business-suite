import { Customer, CustomerFormData } from '@/types'

const API_BASE = '/api/customers'

// Fetch all customers
export async function getCustomers(): Promise<Customer[]> {
    const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch customers')
    }

    return response.json()
}

// Add a new customer
export async function addCustomer(data: CustomerFormData): Promise<Customer> {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add customer')
    }

    return response.json()
}

// Update an existing customer
export async function updateCustomer(
    customerId: string,
    data: CustomerFormData
): Promise<Customer> {
    const response = await fetch(`${API_BASE}/${customerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update customer')
    }

    return response.json()
}

// Delete a customer
export async function deleteCustomer(customerId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${customerId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete customer')
    }
}

// Get a single customer by ID
export async function getCustomer(customerId: string): Promise<Customer> {
    const response = await fetch(`${API_BASE}/${customerId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch customer')
    }

    return response.json()
}