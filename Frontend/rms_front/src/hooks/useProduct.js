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
        product_Stock: product.product_Stock,
        product_Expiry: product.product_Expiry,
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
    }
    async function updateProduct(product){      
      await axios.post(`${BASE_URL}/products/update`,{
            id: product.id,
            product_Name: product.product_Name,
            product_Price: product.product_Price,
            product_Stock: product.product_Stock,
            product_Expiry: product.product_Expiry,
        })
    }
    async function searchProduct(input){
       const search = await axios.get(`${BASE_URL}/products/search`, {
        params: {query:input}
       })
       setProducts(search.data);
    }
    async function priceSort(order){
      const sortedPrice = await axios.get(`${BASE_URL}/products/price`,{
        params: {sort:order}
      })
      setProducts(sortedPrice.data)
    }
    async function stockSort(order){
      const sortedStock = await axios.get(`${BASE_URL}/products/stock`, {
        params: {sort:order}
      });
      setProducts(sortedStock.data);
    }
    async function expirySort(order) {
      const sortedExpiry = await axios.get(`${BASE_URL}/products/expiry`, {
        params: {sort:order}
      });
      setProducts(sortedExpiry.data)
    }
    

return {
    products,
    useProduct,
    getAllProducts,
    createProducts,
    deleteProduct,
    updateProduct,
    searchProduct,
    priceSort,
    stockSort,
    expirySort
};
}