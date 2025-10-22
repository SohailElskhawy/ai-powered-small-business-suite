import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProductFormData } from '@/types'

export async function PUT(
    request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
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

        const body: ProductFormData = await request.json()

        // Validate required fields
        if (!body.name?.trim() || !body.sku?.trim() || body.unitPrice == null || body.stockQuantity == null) {
            return NextResponse.json(
                { error: 'Name, SKU, Unit Price, and Stock Quantity are required' },
                { status: 400 }
            )
        }
        const {id} = await params
        const productId = id

        // Check if product exists and belongs to user
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: productId,
                userId: user.id
            }
        })

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Update product
        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                name: body.name,
                sku: body.sku,
                description: body.description ?? null,
                unitPrice: body.unitPrice,
                stockQuantity: body.stockQuantity
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error("Error updating product:", error)
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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
        const {id} = await params
        const productId = id
        // Check if product exists and belongs to user
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: productId,
                userId: user.id
            }
        })

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Delete product
        await prisma.product.delete({
            where: { id: productId }
        })

        return NextResponse.json({ message: 'Product deleted successfully' })
    } catch (error) {
        console.error("Error deleting product:", error)
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
}