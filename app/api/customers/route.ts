import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CustomerFormData } from '@/types'

// GET - Fetch all customers for the authenticated user
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const customers = await prisma.customer.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(customers)
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        )
    }
}

// POST - Create a new customer
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body: CustomerFormData = await request.json()

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

        // Check if customer with same email already exists for this user
        if (body.email) {
            const existingCustomer = await prisma.customer.findFirst({
                where: {
                    userId: user.id,
                    email: body.email
                }
            })

            if (existingCustomer) {
                return NextResponse.json(
                    { error: 'A customer with this email already exists' },
                    { status: 409 }
                )
            }
        }

        const customer = await prisma.customer.create({
            data: {
                userId: user.id,
                name: body.name.trim(),
                email: body.email?.trim() || null,
                phone: body.phone?.trim() || null,
                address: body.address?.trim() || null,
                notes: body.notes?.trim() || null,
            }
        })

        return NextResponse.json(customer, { status: 201 })
    } catch (error) {
        console.error('Error creating customer:', error)
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        )
    }
}