import axios from 'axios';
import { useState } from 'react';

export function usePackage() {
  const [packages, setPackages] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [balance, setBalance] = useState(0);
  const BASE_URL = "http://localhost:3000";

  // Compute balance from all packages
  function computeBalance(packagesList) {
    return packagesList
      .filter(p => p.payment_Status.toLowerCase() === "paid")
      .reduce((sum, p) => sum + Number(p.price || 0), 0);
  }

  async function getAllPackage() {
    try {
      const res = await axios.get(`${BASE_URL}/packages`);
      setPackages(res.data);
      setBalance(computeBalance(res.data)); // initialize balance
    } catch (err) {
      console.error("Error fetching packages:", err);
    }
  }

  async function createPackage(packg) {
    try {
      const res = await axios.post(`${BASE_URL}/packages/create`, {
        ...packg,
        payment_Status: "unpaid"
      });

      setPackages(prev => [...prev, res.data]);
      // No balance change because package is unpaid
    } catch (err) {
      console.error("Error creating package:", err);
    }
  }

  async function deletePackage(packg) {
    try {
      await axios.post(`${BASE_URL}/packages/delete`, { id: packg.id });

      setPackages(prev => prev.filter(p => p.id !== packg.id));
      setBalance(prev => prev - (packg.payment_Status.toLowerCase() === "paid" ? Number(packg.price || 0) : 0));
    } catch (err) {
      console.error("Error deleting package:", err);
    }
  }

  async function updatePackage(packg) {
    try {
      const original = packages.find(p => p.id === packg.id);

      const res = await axios.post(`${BASE_URL}/packages/update`, {
        ...packg,
        payment_Status: packg.payment_Status.toLowerCase()
      });

      const updated = res.data.package || res.data;

      // Update balance
      let newBalance = balance;
      if (original.payment_Status.toLowerCase() === "unpaid" && updated.payment_Status.toLowerCase() === "paid") {
        newBalance += Number(updated.price || 0);
      }
      if (original.payment_Status.toLowerCase() === "paid" && updated.payment_Status.toLowerCase() === "unpaid") {
        newBalance -= Number(updated.price || 0);
      }
      setBalance(newBalance);

      setPackages(prev => prev.map(p => p.id === packg.id ? updated : p));
    } catch (err) {
      console.error("Error updating package:", err);
    }
  }

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
    balance,
    getAllPackage,
    createPackage,
    deletePackage,
    updatePackage,
    getAllSellers,
  };
}
