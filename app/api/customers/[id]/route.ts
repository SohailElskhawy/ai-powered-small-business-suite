import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CustomerFormData } from '@/types'

// GET - Fetch a single customer by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const {id} = await params
        const customerId = id

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Find customer that belongs to the user
        const customer = await prisma.customer.findFirst({
            where: {
                id: customerId,
                userId: user.id
            }
        })

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(customer)
    } catch (error) {
        console.error('Error fetching customer:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        )
    }
}

// PUT - Update an existing customer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: CustomerFormData = await request.json()
        const {id} = await params
        const customerId = id

        // Validate required fields
        if (!body.name?.trim()) {
            return NextResponse.json(
                { error: 'Customer name is required' },
                { status: 400 }
            )
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if customer exists and belongs to the user
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                id: customerId,
                userId: user.id
            }
        })

        if (!existingCustomer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Check if customer with same email already exists for this user (excluding current customer)
        if (body.email && body.email !== existingCustomer.email) {
            const duplicateCustomer = await prisma.customer.findFirst({
                where: {
                    userId: user.id,
                    email: body.email,
                    id: { not: customerId }
                }
            })

            if (duplicateCustomer) {
                return NextResponse.json(
                    { error: 'A customer with this email already exists' },
                    { status: 409 }
                )
            }
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: {
                name: body.name.trim(),
                email: body.email?.trim() || null,
                phone: body.phone?.trim() || null,
                address: body.address?.trim() || null,
                notes: body.notes?.trim() || null,
            }
        })

        return NextResponse.json(updatedCustomer)
    } catch (error) {
        console.error('Error updating customer:', error)
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        )
    }
}

// DELETE - Delete an existing customer
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const {id} = await params
        const customerId = id

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if customer exists and belongs to the user
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                id: customerId,
                userId: user.id
            }
        })

        if (!existingCustomer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Check if customer has any invoices
        const invoiceCount = await prisma.invoice.count({
            where: { customerId: customerId }
        })

        if (invoiceCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete customer with existing invoices' },
                { status: 409 }
            )
        }

        await prisma.customer.delete({
            where: { id: customerId }
        })

        return NextResponse.json({ message: 'Customer deleted successfully' })
    } catch (error) {
        console.error('Error deleting customer:', error)
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 }
        )
    }
}