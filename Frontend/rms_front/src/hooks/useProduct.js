import axios from "axios";
import { useState, useCallback } from "react";

// --- Optional debounce helper ---
function debounce(cb, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), delay);
  };
}

// ✅ HELPER FUNCTION TO GET ADMIN ID
const getCurrentAdminId = () => {
  return localStorage.getItem('currentAdminId') || '1'; // Fallback to admin 1
};

export function useProduct() {
  const BASE_URL = "http://localhost:3000";

  // --- State ---
  const [products, setProducts] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Error handler ---
  const handleError = (err) => {
    console.error(err);
    setError(err?.message || "Something went wrong");
  };

  // ✅ UPDATED: Fetch all active products WITH ADMIN HEADER
  const getAllProducts = useCallback(async (page = 1, limit = 7) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/products?page=${page}&limit=${limit}`, {
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products || []);
      setError("");
      return data;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ UPDATED: Fetch all archived products WITH ADMIN HEADER
  const archivedProducts = useCallback(async (page = 1, limit = 7) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/products/archived?page=${page}&limit=${limit}`, {
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      if (!res.ok) throw new Error("Failed to load archived products");
      const data = await res.json();
      setArchived(data.products || []);
      setError("");
      return data;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ UPDATED: Create product WITH ADMIN HEADER
  const createProduct = async (product) => {
    try {
      const response = await axios.post(`${BASE_URL}/products/create`, product, {
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      await getAllProducts();
    } catch (err) {
      handleError(err);
    }
  };

  // ✅ UPDATED: Update product WITH ADMIN HEADER
  const updateProduct = async (product) => {
    try {
      await axios.post(`${BASE_URL}/products/update`, product, {
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      await getAllProducts();
    } catch (err) {
      handleError(err);
    }
  };

  // ✅ UPDATED: Delete product WITH ADMIN HEADER
  const deleteProduct = async (product) => {
    try {
      await axios.post(`${BASE_URL}/products/delete`, { id: product.id }, {
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      await getAllProducts();
    } catch (err) {
      handleError(err);
    }
  };

  // ✅ UPDATED: Archive product WITH ADMIN HEADER
  const archiveProduct = async (product) => {
    try {
      await axios.post(`${BASE_URL}/products/archive`, { id: product.id }, {
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      await getAllProducts();
      await archivedProducts();
    } catch (err) {
      handleError(err);
    }
  };

  // ✅ UPDATED: Unarchive product WITH ADMIN HEADER
  const archiveAddBack = async (product) => {
    try {
      await axios.post(`${BASE_URL}/products/addBack`, { id: product.id }, {
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      await getAllProducts();
      await archivedProducts();
    } catch (err) {
      handleError(err);
    }
  };

  // ✅ UPDATED: Search product WITH ADMIN HEADER
  const searchProduct = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/products/search`, { 
          params: { query },
          headers: {
            'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
          }
        });
        setProducts(res.data || []);
        setError("");
      } catch (err) {
        handleError(err);
      }
    }, 300),
    []
  );

  // ✅ UPDATED: Search archived product WITH ADMIN HEADER
  const searchArchivedProduct = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setArchived([]);
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/products/searchArchive`, { 
          params: { query },
          headers: {
            'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
          }
        });
        setArchived(res.data || []);
        setError("");
      } catch (err) {
        handleError(err);
      }
    }, 300),
    []
  );

  // ✅ UPDATED: Category sort WITH ADMIN HEADER
  const categorySort = async (order) => {
    try {
      const res = await axios.get(`${BASE_URL}/products/category`, { 
        params: { sort: order },
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      setProducts(res.data?.length ? res.data : []);
      setError(res.data?.length ? "" : `No products for: ${order}`);
    } catch (err) {
      handleError(err);
    }
  };

  // ✅ UPDATED: Category archive sort WITH ADMIN HEADER
  const categoryArchiveSort = async (order) => {
    try {
      const res = await axios.get(`${BASE_URL}/products/categoryArchive`, { 
        params: { sort: order },
        headers: {
          'X-Admin-ID': getCurrentAdminId() // ✅ ADD ADMIN HEADER
        }
      });
      setArchived(res.data?.length ? res.data : []);
      setError(res.data?.length ? "" : `No archived products for: ${order}`);
    } catch (err) {
      handleError(err);
    }
  };

  // --- Return everything ---
  return {
    products,
    archived,
    loading,
    error,
    setError,
    getAllProducts,
    archivedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    archiveProduct,
    archiveAddBack,
    searchProduct,
    searchArchivedProduct,
    categorySort,
    categoryArchiveSort,
  };
}