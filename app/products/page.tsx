"use client"

import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { formatDate } from '@/lib/utils'
import { Product } from '@prisma/client'
import { addProduct, deleteProduct, getProducts, updateProduct } from '@/lib/products'
import { ProductFormData } from '@/types'
import { AddProductModal, DeleteProductModal, EditProductModal } from '@/components/products/form-modal'

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // Load products on component mount
    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            setLoading(true)
            const productData = await getProducts()
            setProducts(productData)
        } catch (error) {
            console.error("Error loading products:", error)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }

    // Handle adding a new product
    const handleAddProduct = async (data: ProductFormData) => {
        try {
            // Convert ProductFormData to the format expected by the API
            const productData: ProductFormData = {
                name: data.name,
                sku: data.sku,
                description: data.description,
                unitPrice: data.unitPrice,
                stockQuantity: data.stockQuantity
            }
            const newProduct = await addProduct(productData)
            setProducts(prev => [newProduct, ...prev])
            toast.success("Product added successfully!")
        } catch (error) {
            console.error("Error adding product:", error)
            toast.error("Failed to add product")
            throw error // Re-throw to keep modal loading state
        }
    }

    // Handle editing a product
    const handleEditProduct = async (productId: string, data: ProductFormData) => {
        try {
            // Convert ProductFormData to the format expected by the API
            const productData: ProductFormData = {
                name: data.name,
                sku: data.sku,
                description: data.description,
                unitPrice: data.unitPrice,
                stockQuantity: data.stockQuantity
            }
            const updatedProduct = await updateProduct(productId, productData)
            setProducts(prev => prev.map(product => 
                product.id === productId ? updatedProduct : product
            ))
            toast.success("Product updated successfully!")
        } catch (error) {
            console.error("Error updating product:", error)
            toast.error("Failed to update product")
            throw error // Re-throw to keep modal loading state
        }
    }

    // Handle deleting a product
    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteProduct(productId)
            setProducts(prev => prev.filter(product => product.id !== productId))
            toast.success("Product deleted successfully!")
        } catch (error) {
            console.error("Error deleting product:", error)
            toast.error("Failed to delete product")
            throw error // Re-throw to keep modal loading state
        }
    }

    // Filter products based on search query
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())))
    

    // Format date for display


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex flex-row justify-between items-center p-6 bg-white border-b">
                <div className="flex space-x-1">
                    <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                    <AddProductModal onSubmit={handleAddProduct} />
                </div>
            </div>
            
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="text-gray-500">Loading products...</div>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="w-48">Description</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock Quantity</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell className="w-48">
                                            <div 
                                                className="truncate max-w-48" 
                                                title={product.description || '-'}
                                            >
                                                {product.description || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>${Number(product.unitPrice).toFixed(2)}</TableCell>
                                        <TableCell>{product.stockQuantity}</TableCell>
                                        <TableCell>{formatDate(product.createdAt)}</TableCell>
                                        <TableCell>{formatDate(product.updatedAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <EditProductModal
                                                    product={{
                                                        id: product.id,
                                                        name: product.name,
                                                        sku: product.sku,
                                                        description: product.description,
                                                        unitPrice: Number(product.unitPrice),
                                                        stockQuantity: product.stockQuantity
                                                    }}
                                                    onSubmit={(data) => handleEditProduct(product.id, data)}
                                                />
                                                <DeleteProductModal
                                                    product={{ id: product.id, name: product.name }}
                                                    onDelete={handleDeleteProduct}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                        {searchQuery ? 'No products found matching your search.' : 'No products found.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
