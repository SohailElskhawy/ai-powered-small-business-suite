import { NextResponse } from 'next/server'
import { customers, products } from '@/lib/dummyData'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Helper to get random elements from an array
function getRandom<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        await prisma.$transaction(async (tx) => {
            // 1️⃣ Create customers and store them
            const createdCustomers = []
            for (const customer of customers) {
                const newCustomer = await tx.customer.create({
                    data: {
                        userId: user.id,
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        notes: customer.notes,
                    },
                })
                createdCustomers.push(newCustomer)
            }

            // 2️⃣ Create products and store them
            const createdProducts = []
            for (const product of products) {
                const newProduct = await tx.product.create({
                    data: {
                        userId: user.id,
                        name: product.name,
                        sku: product.sku,
                        description: product.description,
                        unitPrice: product.unitPrice,
                        stockQuantity: product.stockQuantity,
                    },
                })
                createdProducts.push(newProduct)
            }

            // 3️⃣ Generate random invoices
            const statuses = ['DRAFT', 'SENT', 'PAID', 'OVERDUE'] as const

            for (let i = 0; i < 8; i++) {
                const randomCustomer =
                    createdCustomers[Math.floor(Math.random() * createdCustomers.length)]
                const randomItems = getRandom(createdProducts, Math.floor(Math.random() * 3) + 1)

                const itemsData = randomItems.map((product) => {
                    const quantity = Math.floor(Math.random() * 3) + 1
                    const lineTotal = quantity * Number(product.unitPrice)
                    return {
                        productId: product.id,
                        description: product.description,
                        quantity,
                        unitPrice: product.unitPrice,
                        lineTotal,
                    }
                })

                const totalAmount = itemsData.reduce((sum, item) => sum + item.lineTotal, 0)
                const dueDate = new Date()
                dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 7)

                await tx.invoice.create({
                    data: {
                        userId: user.id,
                        customerId: randomCustomer.id,
                        invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        dueDate,
                        totalAmount,
                        items: {
                            create: itemsData,
                        },
                    },
                })
            }
        })

        return NextResponse.json(
            { message: '✅ Customers, products, and random invoices seeded successfully!' },
            { status: 201 }
        )
    } catch (error) {
        console.error('❌ Error seeding data:', error)
        return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
