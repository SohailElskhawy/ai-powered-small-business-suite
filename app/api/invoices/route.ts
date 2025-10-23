import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { InvoiceFormData } from '@/types'

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

        const invoices = await prisma.invoice.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            include:{
                customer: true,
                items: true
            }
        })

        return NextResponse.json(invoices)
    } catch (error) {
        console.error('Error fetching invoices:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        )
    }
}

// POST - Create a new invoice
export async function POST(request: NextRequest) {
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

        const body: InvoiceFormData = await request.json()
        
        // Validate required fields
        if (!body.customerId?.trim() || !body.dueDate?.trim() || body.items.length === 0) {
            return NextResponse.json(
                { error: 'Customer, Due Date, and at least one item are required' },
                { status: 400 }
            )
        }

        // Generate unique invoice number
        const invoiceCount = await prisma.invoice.count({
            where: { userId: user.id }
        })
        const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`

        // Calculate total amount
        const totalAmount = body.items.reduce((sum, item) => sum + item.lineTotal, 0)

        // Create invoice with items in a transaction
        const invoice = await prisma.invoice.create({
            data: {
                userId: user.id,
                customerId: body.customerId,
                invoiceNumber: invoiceNumber,
                dueDate: new Date(body.dueDate),
                status: 'DRAFT',
                totalAmount: totalAmount,
                items: {
                    create: body.items.map(item => ({
                        productId: item.productId || null,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        lineTotal: item.lineTotal
                    }))
                }
            },
            include: {
                items: true,
                customer: true
            }
        })

        return NextResponse.json(invoice, { status: 201 })
    } catch (error) {
        console.error('Error creating invoice:', error)
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        )
    }
}