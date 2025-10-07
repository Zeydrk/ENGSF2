import axios from 'axios';
import { useState } from 'react';

export function useProduct(){
    const [products, setProducts] = useState([]);
    const BASE_URL = 'http://localhost:3000';

    async function getAllProducts(){
        const products = await axios.get(`${BASE_URL}/products`);
        setProducts(products.data)
    }
    async function createProducts(product){
         try{
     const response = await axios.post(`${BASE_URL}/products/create`, {
        product_Name: product.product_Name,
        product_Price: product.product_Price,
      });
      
        setProducts(prev => [...prev, response.data]);
    }
    catch (error) {
    // If there's an error, handle it here
    if (error.response) {
      // Server responded with a status outside 2xx
      console.error('Server Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No Response:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
  }
    }
    async function deleteProduct(product){
        const response = await axios.post(`${BASE_URL}/products/delete`, {
            id: product.id
        });
        console.log(response);
    }
    async function updateProduct(product){      
        const response = await axios.post(`${BASE_URL}/products/update`,{
            id: product.id,
            product_Name: product.product_Name,
            product_Price: product.product_Price
        })
        console.log(response)

    }
return {
    products,
    useProduct,
    getAllProducts,
    createProducts,
    deleteProduct,
    updateProduct
};
}