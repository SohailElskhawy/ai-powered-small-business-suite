import { Product } from "@prisma/client";
import { ProductFormData } from "@/types";

const API_BASE = '/api/products';

export const getProducts = async (): Promise<Product[]> => {
    const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch products');
    }
    return response.json();
}

export const addProduct = async (data: ProductFormData): Promise<Product> => {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add product');
    }
    return response.json();

}

export const updateProduct = async (productId: string, data: ProductFormData): Promise<Product> => {
    const response = await fetch(`${API_BASE}/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
    }
    return response.json();
}

export const deleteProduct = async (productId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${productId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
    }
    return;
}

export const getProductsCount = async (): Promise<number> => {
    const response = await fetch(`${API_BASE}/length`, {
        method: 'GET',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch products count');
    }
    return response.json();
}
