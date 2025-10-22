import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Get invoice with items and customer
        const invoice = await prisma.invoice.findFirst({
            where: {
                id: params.id,
                userId: user.id
            },
            include: {
                items: true,
                customer: true
            }
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Error fetching invoice:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invoice' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const body = await request.json()

        // Check if invoice exists and belongs to user
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                id: params.id,
                userId: user.id
            }
        })

        if (!existingInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Update invoice
        const invoice = await prisma.invoice.update({
            where: { id: params.id },
            data: body,
            include: {
                items: true,
                customer: true
            }
        })

        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Error updating invoice:', error)
        return NextResponse.json(
            { error: 'Failed to update invoice' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Check if invoice exists and belongs to user
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                id: params.id,
                userId: user.id
            }
        })

        if (!existingInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Delete invoice (items will be deleted automatically due to cascade)
        await prisma.invoice.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Invoice deleted successfully' })
    } catch (error) {
        console.error('Error deleting invoice:', error)
        return NextResponse.json(
            { error: 'Failed to delete invoice' },
            { status: 500 }
        )
    }
}
