import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProductFormData } from '@/types'

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

        const products = await prisma.product.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
}


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

        const body: ProductFormData = await request.json()

        // Validate required fields
        if (!body.name?.trim() || !body.sku?.trim() || body.unitPrice == null || body.stockQuantity == null) {
            return NextResponse.json(
                { error: 'Name, SKU, Unit Price, and Stock Quantity are required' },
                { status: 400 }
            )
        }

        // Create product
        const product = await prisma.product.create({
            data: {
                name: body.name,
                sku: body.sku,
                description: body.description ?? null,
                unitPrice: body.unitPrice,
                stockQuantity: body.stockQuantity,
                userId: user.id
            }
        })

        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        console.error("Error creating product:", error)
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
}