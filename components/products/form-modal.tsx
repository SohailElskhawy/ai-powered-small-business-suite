"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Loader2, Trash2 } from "lucide-react"
import { ProductFormData } from '@/types'

// Form validation schema
const productFormSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    description: z.string().optional(),
    unitPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Unit price must be a non-negative number",
    }),
    stockQuantity: z.string().refine((val) => Number.isInteger(Number(val)) && Number(val) >= 0, {
        message: "Stock quantity must be a non-negative integer",
    }),
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormModalProps {
    mode: "add" | "edit" | "add_quick_action"
    product?: {
        id: string
        name: string
        sku: string | null
        description?: string | null
        unitPrice: number
        stockQuantity: number
    }
    trigger?: React.ReactNode
    onSubmit: (data: ProductFormData) => Promise<void>
}

export function ProductFormModal({
    mode,
    product,
    trigger,
    onSubmit
}: ProductFormModalProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: product?.name || '',
            sku: product?.sku || '',
            description: product?.description || '',
            unitPrice: product ? product.unitPrice.toString() : '',
            stockQuantity: product ? product.stockQuantity.toString() : '',
        },
    })

    const handleSubmit = async (data: ProductFormValues) => {
        setIsLoading(true)
        try {
            // Convert form data to the proper types
            const productData: ProductFormData = {
                name: data.name,
                sku: data.sku,
                description: data.description || undefined,
                unitPrice: parseFloat(data.unitPrice),
                stockQuantity: parseInt(data.stockQuantity, 10),
            }
            await onSubmit(productData)
            setOpen(false)
            form.reset()
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const defaultTrigger = mode === "add" ? (
        <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
        </Button>
    ) : mode === "add_quick_action" ?
        <Button className="w-full justify-start cursor-pointer">
            Add New Product
        </Button>
        : (
            <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
            </Button>
        )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>
                        {(mode === "add" || mode === "add_quick_action") ? "Add New Product" : "Edit Product"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "add" || mode === "add_quick_action"
                            ? "Enter the product's information below to add it to your database."
                            : "Update the product's information below."
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Product Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Stock Keeping Unit"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="unitPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0.00"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Product description (optional)"
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="stockQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                {mode === "add" || mode === "add_quick_action" ? "Add Product" : "Update Product"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

// Export a convenience component for adding products
export function AddProductModal({ onSubmit, mode="add" }: { onSubmit: (data: ProductFormData) => Promise<void>, mode?: "add" | "add_quick_action" }) {
    return (
        <ProductFormModal
            mode={mode}
            onSubmit={onSubmit}
        />
    )
}

// Export a convenience component for editing products
export function EditProductModal({
    product,
    onSubmit
}: {
    product: ProductFormModalProps['product']
    onSubmit: (data: ProductFormData) => Promise<void>
}) {
    return (
        <ProductFormModal
            mode="edit"
            product={product}
            onSubmit={onSubmit}
        />
    )
}

// Export a convenience component for deleting products
export function DeleteProductModal({
    product,
    onDelete
}: {
    product: { id: string; name: string }
    onDelete: (productId: string) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await onDelete(product.id)
            setOpen(false)
        } catch (error) {
            console.error("Error deleting product:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Delete Product
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
