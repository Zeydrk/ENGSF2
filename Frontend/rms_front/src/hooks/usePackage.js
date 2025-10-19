import axios from 'axios';
import { useState } from 'react';

export function usePackage(){
    const [packages, setPackage] = useState([]);
    const BASE_URL = 'http://localhost:3000';

    async function getAllPackage(){
        const packages = await axios.get(`${BASE_URL}/packages`);
        setPackage(packages.data)
    }
    
    async function createPackage(packg){
         try{
     const response = await axios.post(`${BASE_URL}/packages/create`, {
        seller_Name: packg.seller_Name, // Changed from seller_Id to seller_Name
        package_Name: packg.package_Name,
        recipient_Name: packg.recipient_Name,
        descrtion: packg.descrtion,
      });
      
        setPackage(prev => [...prev, response.data]);
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
    
    async function deletePackage(packg){
        const response = await axios.post(`${BASE_URL}/packages/delete`, {
            id: packg.id
        });
    }
    
    async function updatePackage(packg){      
      await axios.post(`${BASE_URL}/packages/update`,{
            id: packg.id,
            seller_Name: packg.seller_Name, // Changed from seller_Id to seller_Name
            package_Name: packg.package_Name,
            recipient_Name: packg.recipient_Name,
            descrtion: packg.descrtion,
        })
    }

    return {
        packages,
        getAllPackage,
        createPackage,
        deletePackage,
        updatePackage
    };
}