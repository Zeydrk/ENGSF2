import axios from 'axios';
import { useState } from 'react';

export function usePackage() {
  const [packages, setPackages] = useState([]);
  const [sellers, setSellers] = useState([]);
  const BASE_URL = "http://localhost:3000";

  // Get all packages
  async function getAllPackage() {
    try {
      const res = await axios.get(`${BASE_URL}/packages`);
      setPackages(res.data);
    } catch (err) {
      console.error("Error fetching packages:", err);
    }
  }

  // Create a new package
  async function createPackage(packg) {
    try {
      const res = await axios.post(`${BASE_URL}/packages/create`, {
        seller_Name: packg.seller_Name,
        package_Name: packg.package_Name,
        buyer_Name: packg.buyer_Name,
        dropOff_Date: packg.dropOff_Date,
        package_Size: packg.package_Size,
        price: packg.price,
        handling_Fee: packg.handling_Fee,
        payment_Method: packg.payment_Method,
        payment_Status: packg.payment_Status,
        package_Status: packg.package_Status,
      });

      setPackages(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating package:", err);
    }
  }

  // Delete a package
  async function deletePackage(packg) {
    try {
      await axios.post(`${BASE_URL}/packages/delete`, { id: packg.id });
      setPackages(prev => prev.filter(p => p.id !== packg.id));
    } catch (err) {
      console.error("Error deleting package:", err);
    }
  }

  // Update a package
  async function updatePackage(packg) {
    try {
      const res = await axios.post(`${BASE_URL}/packages/update`, {
        id: packg.id,
        seller_Name: packg.seller_Name,
        package_Name: packg.package_Name,
        buyer_Name: packg.buyer_Name,
        dropOff_Date: packg.dropOff_Date,
        package_Size: packg.package_Size,
        price: packg.price,
        handling_Fee: packg.handling_Fee,
        payment_Method: packg.payment_Method,
        payment_Status: packg.payment_Status,
        package_Status: packg.package_Status,
      });

      setPackages(prev => prev.map(p => p.id === packg.id ? res.data.package || res.data : p));
    } catch (err) {
      console.error("Error updating package:", err);
    }
  }

  // Get all sellers for dropdown
  async function getAllSellers() {
    try {
      const res = await axios.get(`${BASE_URL}/packages/sellers/list`);
      setSellers(res.data);
    } catch (err) {
      console.error("Error fetching sellers:", err);
    }
  }

  return {
    packages,
    sellers,
    getAllPackage,
    createPackage,
    deletePackage,
    updatePackage,
    getAllSellers,
  };
}
