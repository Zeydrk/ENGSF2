import axios from 'axios';
import { useState } from 'react';

export function useProduct(){
    const [products, setProducts] = useProduct([]);
    const BASE_URL = 'https://localhost:3000';

    async function getAllProducts(){
        const products = await axios.get(`${BASE_URL}/products`);
        setProducts(products.data)
    }
    async function createProducts(){
        const response = await axios.post(`${BASE_URL}/products/create`, {
            product_Name:response.p_Name,
            product_Price:response.p_Price
        });
        setProducts(prev => [...prev ,response.data])
    }
    async function deleteProduct(){
        const response = await axios.post(`${BASE_URL}/products/delete`, {
            id: response.id
        });
    }
    async function updateProduct(){

    }
return {
    products,
    getAllProducts,
    createProducts,
    deleteProduct,
    updateProduct
};
}